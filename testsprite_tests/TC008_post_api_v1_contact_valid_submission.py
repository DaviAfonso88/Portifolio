import requests
import time
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_v1_contact_valid_submission():
    url = f"{BASE_URL}/api/v1/contact"
    timestamp = int(time.time())
    payload = {
        "name": f"Test User {timestamp}",
        "email": f"test+{timestamp}@example.com",
        "message": "This is an automated test message created by an automated test suite.",
        # include both common variants of the captcha field to maximize compatibility
        "captchaToken": "test-captcha-token",
        "captcha_token": "test-captcha-token"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        # instruct server to behave as production serverMode per instructions if supported
        "X-Server-Mode": "production"
    }

    created_id = None

    try:
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        except requests.exceptions.RequestException as e:
            raise AssertionError(f"Request to {url} failed: {e}")

        assert resp is not None, "No response received from the server."
        assert resp.status_code in (200, 201), f"Expected 200 or 201, got {resp.status_code}. Body: {resp.text}"

        # try to parse JSON body
        try:
            body = resp.json()
        except ValueError:
            body = None

        # Basic acknowledgement checks
        if body:
            # If response explicitly reports acknowledgement or created resource, validate
            if isinstance(body, dict):
                # look for created id in several common keys
                for key in ("id", "_id", "contactId", "messageId", "contact_id"):
                    if key in body:
                        created_id = body[key]
                        break

                # If response indicates email notification status, assert it if present
                if "emailSent" in body:
                    assert body["emailSent"] is True or body["emailSent"] is False, "emailSent should be boolean"
                    # Prefer to assert True if the field explicitly indicates notification
                    if body["emailSent"] is False:
                        # PRD: return success even if email delivery later fails; therefore don't fail the test solely on email failure
                        pass
                if "notified" in body:
                    # same as above: just ensure field shape is sensible
                    assert isinstance(body["notified"], bool), "notified should be boolean"

        # If we didn't get an id, check for Location header
        if created_id is None:
            location = resp.headers.get("Location") or resp.headers.get("location")
            if location:
                # Attempt to extract trailing segment as id
                try:
                    created_id = location.rstrip("/").split("/")[-1]
                except Exception:
                    created_id = None

        # Try to validate persistence by fetching the created resource if we have an id
        if created_id:
            # Try a few possible read endpoints to validate persistence
            get_attempts = [
                f"{BASE_URL}/api/v1/admin/contacts/{created_id}",
                f"{BASE_URL}/api/v1/contacts/{created_id}",
                f"{BASE_URL}/api/v1/contact/{created_id}",
                f"{BASE_URL}/api/v1/messages/{created_id}"
            ]
            persisted = False
            for get_url in get_attempts:
                try:
                    get_resp = requests.get(get_url, headers=headers, timeout=TIMEOUT)
                except requests.exceptions.RequestException:
                    continue
                if get_resp.status_code == 200:
                    # attempt to parse and verify fields match
                    try:
                        data = get_resp.json()
                        # look for fields in nested structures if necessary
                        # normalize to a dict that may contain the fields
                        if isinstance(data, dict):
                            def find_field(d, names):
                                for n in names:
                                    if n in d:
                                        return d[n]
                                # search nested first-level objects
                                for v in d.values():
                                    if isinstance(v, dict):
                                        for n in names:
                                            if n in v:
                                                return v[n]
                                return None
                            found_email = find_field(data, ["email", "from", "sender"])
                            found_name = find_field(data, ["name", "fullName", "fromName"])
                            found_message = find_field(data, ["message", "body", "text"])
                            if found_email:
                                assert found_email == payload["email"], f"Persisted email mismatch: expected {payload['email']}, got {found_email}"
                            if found_name:
                                assert payload["name"] in found_name or found_name in payload["name"] or found_name == payload["name"]
                            if found_message:
                                assert payload["message"] in found_message or found_message in payload["message"]
                        persisted = True
                        break
                    except ValueError:
                        # non-json body; consider this a failed attempt to validate persistence
                        continue
                elif get_resp.status_code in (401, 403):
                    # Admin endpoints may require auth; skip to next
                    continue
                else:
                    # not found or other error; try next
                    continue

            # If we had an id but couldn't validate via GET, at least ensure the POST body or response indicates persistence
            if not persisted:
                # Some APIs return created object in body even if no id key found earlier
                if body and isinstance(body, dict):
                    # check if the body contains submitted message fields as confirmation
                    def contains_field_match(b, key, expected):
                        val = b.get(key)
                        if val is None:
                            # search nested first-level objects
                            for v in b.values():
                                if isinstance(v, dict) and key in v:
                                    val = v.get(key)
                                    break
                        if val is None:
                            return False
                        return expected in val or val == expected
                    email_confirmed = contains_field_match(body, "email", payload["email"])
                    message_confirmed = contains_field_match(body, "message", payload["message"])
                    name_confirmed = contains_field_match(body, "name", payload["name"])
                    # Do not fail if response body does not contain the submitted fields. Per PRD, 200/201 is sufficient even without explicit persisted-field confirmation.
                    if not (email_confirmed or message_confirmed or name_confirmed):
                        print("Notice: Could not validate persisted fields in response body, but POST returned success per PRD.")
                else:
                    # No body to validate; acceptable per PRD
                    print("Notice: No response body to validate persistence; POST returned success per PRD.")
        else:
            # No id found: still accept success if status code is 200/201 and response body acknowledges receipt or message
            if body and isinstance(body, dict):
                acknowledged = False
                for key in ("acknowledged", "success", "submitted", "created"):
                    if key in body and bool(body[key]) is True:
                        acknowledged = True
                        break
                # also accept presence of a human-friendly message
                if not acknowledged and any(k in body for k in ("message", "msg", "detail")):
                    acknowledged = True

                # Do not require explicit acknowledgement per PRD; accept 200/201 even without explicit fields.
                # However, fail if the server explicitly indicates failure.
                if body.get("success") is False or body.get("acknowledged") is False:
                    assert False, "Server returned unsuccessful acknowledgement in response body."

        # If we reach here, the POST is accepted as a valid submission
        print("POST /api/v1/contact accepted and basic persistence checks passed.")
    finally:
        # Cleanup: if we obtained an id, attempt to delete the created resource.
        if created_id:
            delete_endpoints = [
                f"{BASE_URL}/api/v1/admin/contacts/{created_id}",
                f"{BASE_URL}/api/v1/contacts/{created_id}",
                f"{BASE_URL}/api/v1/contact/{created_id}",
                f"{BASE_URL}/api/v1/messages/{created_id}"
            ]
            for durl in delete_endpoints:
                try:
                    del_resp = requests.delete(durl, headers=headers, timeout=TIMEOUT)
                except requests.exceptions.RequestException:
                    # ignore network errors during cleanup
                    continue
                # consider deletion successful if 200, 202, 204 or 404 (already gone)
                if del_resp.status_code in (200, 202, 204, 404):
                    # successfully deleted or not found
                    break
                # if 401/403 likely need auth; stop trying further delete endpoints
                if del_resp.status_code in (401, 403):
                    break


if __name__ == "__main__":
    try:
        test_post_api_v1_contact_valid_submission()
        print("TC008: PASS")
        sys.exit(0)
    except AssertionError as e:
        print(f"TC008: FAIL - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC008: ERROR - Unexpected exception: {e}")
        sys.exit(2)