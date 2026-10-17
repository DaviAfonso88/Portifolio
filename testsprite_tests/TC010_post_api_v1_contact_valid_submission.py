import requests
import sys
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def test_post_api_v1_contact_valid_submission():
    url = f"{BASE_URL}/api/v1/contact"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    payload = {
        "name": "Test User",
        "email": f"testuser+{int(time.time())}@example.com",
        "message": "This is an automated test submission for contact endpoint.",
        # Use a test captcha token; environments often bypass captcha for tests.
        "captchaToken": "test-captcha-token"
    }

    resource_id = None

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Request to {url} failed: {e}")

    # Validate status code is success (201 Created or 200 OK)
    if resp.status_code not in (200, 201):
        raise AssertionError(f"Expected status code 200 or 201, got {resp.status_code}. Response body: {resp.text}")

    # Try to parse JSON response if present
    resp_json = None
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" in content_type:
        try:
            resp_json = resp.json()
        except ValueError:
            raise AssertionError("Response Content-Type is application/json but body is not valid JSON")

    # If JSON provided, perform additional persistence checks
    if resp_json is not None:
        # Attempt to find an ID in common places
        if isinstance(resp_json, dict):
            # top-level id
            if "id" in resp_json:
                resource_id = resp_json["id"]
            # nested data object
            elif "data" in resp_json and isinstance(resp_json["data"], dict) and "id" in resp_json["data"]:
                resource_id = resp_json["data"]["id"]

            # Check that at least one of the submitted fields is echoed back (persistence indicator)
            echoed_fields = 0
            try:
                if ("name" in resp_json and resp_json.get("name") == payload["name"]) or \
                   ("name" in resp_json.get("data", {}) and resp_json["data"].get("name") == payload["name"]):
                    echoed_fields += 1
            except Exception:
                pass

            try:
                if ("email" in resp_json and resp_json.get("email") == payload["email"]) or \
                   ("email" in resp_json.get("data", {}) and resp_json["data"].get("email") == payload["email"]):
                    echoed_fields += 1
            except Exception:
                pass

            try:
                if ("message" in resp_json and resp_json.get("message") == payload["message"]) or \
                   ("message" in resp_json.get("data", {}) and resp_json["data"].get("message") == payload["message"]):
                    echoed_fields += 1
            except Exception:
                pass

            # At minimum expect one of the fields to be present in the response to indicate persistence
            if echoed_fields == 0:
                # If no fields echoed, still acceptable if API returns another persistence indicator such as createdAt or id
                if resource_id is None and not any(k in resp_json for k in ("createdAt", "created_at", "created")):
                    raise AssertionError("Response did not echo submitted fields nor return an ID/created timestamp to indicate persistence.")
        else:
            # Unexpected JSON shape (e.g., list). Consider this a failure to validate persistence.
            raise AssertionError("Response JSON has unexpected shape; expected object with persisted resource information.")

    # If no JSON body, at least ensure there's a success status code (already checked).
    # Optionally, could attempt to verify persistence via other endpoints if available; skipping due to PRD constraints.

    # If resource_id wasn't returned but the endpoint did return success, we still created a resource.
    # Per instructions, attempt cleanup if we can identify an ID. If not, try conservative deletion by querying potential administration endpoints is unsafe; so only delete when we have an ID.
    try:
        if resource_id:
            delete_url = f"{BASE_URL}/api/v1/contact/{resource_id}"
            # Do not send Content-Type for an empty body DELETE to avoid server rejecting empty JSON body
            del_headers = {"Accept": "application/json"}
            try:
                del_resp = requests.delete(delete_url, headers=del_headers, timeout=TIMEOUT)
            except requests.exceptions.RequestException as e:
                # non-fatal: cleanup attempt failed
                raise AssertionError(f"Attempt to delete created contact resource failed: {e}")

            # Accept 200, 202, 204 as successful deletes; 404 means resource not found (maybe already removed) - acceptable
            if del_resp.status_code not in (200, 202, 204, 404):
                raise AssertionError(f"Unexpected status code when deleting resource {resource_id}: {del_resp.status_code}. Body: {del_resp.text}")
    finally:
        # If no resource_id, nothing to clean up explicitly.
        pass

    # If reached here, test passes basic contract checks
    print("test_post_api_v1_contact_valid_submission: PASSED")

if __name__ == "__main__":
    try:
        test_post_api_v1_contact_valid_submission()
    except AssertionError as e:
        print(f"test_post_api_v1_contact_valid_submission: FAILED - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"test_post_api_v1_contact_valid_submission: ERROR - {e}")
        sys.exit(2)
    sys.exit(0)
