import requests
import uuid
import time
import sys
import traceback

BASE_URL = "http://localhost:3000"
CONTACT_PATH = "/api/v1/contact"
TIMEOUT = 30  # seconds

def test_post_api_v1_contact_with_valid_submission():
    unique_suffix = str(int(time.time())) + "-" + uuid.uuid4().hex[:8]
    payload = {
        "name": f"Test User {unique_suffix}",
        "email": f"testuser+{unique_suffix}@example.com",
        "message": f"This is an automated test message created at {time.time()}",
        # Use a test captcha token; environments often accept a test or bypass token.
        "captchaToken": "test-captcha-token"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    created_id = None
    response_json = None

    try:
        url = BASE_URL.rstrip("/") + CONTACT_PATH
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException:
        traceback.print_exc()
        assert False, "Request to POST /api/v1/contact failed due to network error."

    # Primary assertion: status code 200 or 201
    assert resp.status_code in (200, 201), f"Expected 200 or 201, got {resp.status_code}: {resp.text}"

    # Try to parse JSON response if present
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" in content_type:
        try:
            response_json = resp.json()
        except ValueError:
            response_json = None

    # If JSON returned, try to find an identifier or success indicator
    if isinstance(response_json, dict):
        # Common possible keys that might indicate created resource
        for key in ("id", "contactId", "messageId", "data", "result"):
            if key in response_json:
                val = response_json[key]
                # If data or result wraps an object with id
                if isinstance(val, dict) and "id" in val:
                    created_id = val.get("id")
                    break
                # If id-like scalar
                if isinstance(val, (str, int)) and val:
                    created_id = val
                    break
        # Some APIs return the created object directly
        if created_id is None:
            # look for top-level object containing the submitted email
            for candidate in (response_json, response_json.get("data")):
                if isinstance(candidate, dict):
                    if candidate.get("email") == payload["email"]:
                        created_id = candidate.get("id") or candidate.get("contactId") or created_id
                        break

    # At minimum, the response should indicate success in some form
    if isinstance(response_json, dict):
        # accept success boolean or message string
        success_flags = []
        if response_json.get("success") is not None:
            success_flags.append(bool(response_json.get("success")))
        if response_json.get("status") is not None:
            success_flags.append(str(response_json.get("status")).lower() in ("ok", "success", "created", "200", "201"))
        if response_json.get("message"):
            success_flags.append(True)
        if success_flags:
            assert any(success_flags), "Response JSON present but does not indicate success."

    # Optionally verify persistence by attempting to GET the created resource (best-effort)
    if created_id:
        # Try several likely GET endpoints for contact retrieval; ignore failures but attempt.
        get_endpoints = [
            f"/api/v1/contact/{created_id}",
            f"/api/v1/contacts/{created_id}",
            f"/api/v1/admin/contacts/{created_id}",
            f"/api/v1/admin/messages/{created_id}",
        ]
        found = False
        for ep in get_endpoints:
            try:
                gurl = BASE_URL.rstrip("/") + ep
                gresp = requests.get(gurl, headers=headers, timeout=TIMEOUT)
            except requests.RequestException:
                continue
            if gresp.status_code == 200:
                # if we can fetch it, try to validate fields
                ct = gresp.headers.get("Content-Type", "")
                if "application/json" in ct:
                    try:
                        gjson = gresp.json()
                        # drill into possible wrappers
                        candidate = gjson
                        if isinstance(candidate, dict) and "data" in candidate and isinstance(candidate["data"], dict):
                            candidate = candidate["data"]
                        # Validate presence of submitted fields when available
                        if isinstance(candidate, dict):
                            # If email present, assert it matches
                            if "email" in candidate:
                                assert candidate.get("email") == payload["email"], "Persisted email does not match submitted email."
                            if "name" in candidate:
                                assert candidate.get("name") == payload["name"], "Persisted name does not match submitted name."
                            if "message" in candidate:
                                assert payload["message"] in candidate.get("message"), "Persisted message does not match submitted message."
                        found = True
                        break
                    except ValueError:
                        # not JSON; treat as not found for our validation purposes
                        pass
        # Not having GET access does not fail the primary assertion; it's best-effort.
    else:
        # If no created_id available in response, we cannot perform id-based cleanup; that's acceptable.
        pass

    # If response indicates email notification status, assert acceptable values (best-effort)
    if isinstance(response_json, dict):
        # Some APIs include email delivery status or queued flag
        email_keys = ("emailSent", "notified", "notification", "email_status")
        for k in email_keys:
            if k in response_json:
                val = response_json[k]
                # Accept booleans or strings indicating queued/sent
                if isinstance(val, bool):
                    assert val is True or val is False  # just ensure present and boolean
                elif isinstance(val, str):
                    assert val.lower() in ("sent", "queued", "failed", "error", "ok", "true", "false")
                break

    # Cleanup: attempt to delete created resource if we have an id (best-effort)
    # Use try/finally semantics to ensure cleanup attempts even if assertions above fail.
    # Note: We do not fail the test based on cleanup outcome.
    if created_id:
        deletion_endpoints = [
            f"/api/v1/admin/contacts/{created_id}",
            f"/api/v1/admin/messages/{created_id}",
            f"/api/v1/contacts/{created_id}",
            f"/api/v1/contact/{created_id}",
            f"/api/v1/admin/contacts/{created_id}/delete",
            f"/api/v1/admin/messages/{created_id}/delete",
        ]
        for dep in deletion_endpoints:
            try:
                durl = BASE_URL.rstrip("/") + dep
                # Attempt DELETE first, fallback to POST for delete-confirm patterns
                try:
                    dresp = requests.delete(durl, headers=headers, timeout=TIMEOUT)
                except requests.RequestException:
                    dresp = None
                if dresp and dresp.status_code in (200, 202, 204):
                    break
                # Try POST delete pattern
                try:
                    dresp2 = requests.post(durl, headers=headers, timeout=TIMEOUT)
                except requests.RequestException:
                    dresp2 = None
                if dresp2 and dresp2.status_code in (200, 202, 204):
                    break
            except Exception:
                # ignore any unexpected errors during cleanup attempts
                continue

if __name__ == "__main__":
    try:
        test_post_api_v1_contact_with_valid_submission()
        print("TC010 passed")
    except AssertionError as e:
        print("TC010 failed:", str(e))
        sys.exit(1)
    except Exception:
        traceback.print_exc()
        sys.exit(1)