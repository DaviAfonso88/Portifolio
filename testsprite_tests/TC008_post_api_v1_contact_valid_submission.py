import os
import time
import uuid
import requests
import sys

BASE_URL = "http://localhost:3000"
CONTACT_PATH = "/api/v1/contact"
ADMIN_CONTACT_GET_PATH = "/api/v1/admin/contacts/{}"
ADMIN_CONTACT_DELETE_PATH = "/api/v1/admin/contacts/{}"
TIMEOUT = 30

def test_post_api_v1_contact_valid_submission():
    """
    TC008: post api v1 contact valid submission
    Verifies POST /api/v1/contact with valid payload returns 200 or 201,
    that the response includes evidence of persistence (id or echoed fields),
    and attempts to verify/delete the persisted record via admin endpoints if an admin token is provided.
    """
    # Prepare unique payload
    unique_suffix = str(int(time.time())) + "-" + uuid.uuid4().hex[:8]
    name = f"Test User {unique_suffix}"
    email = f"test+{unique_suffix}@example.com"
    message = f"This is an automated test message created at {time.time()}"
    captcha_token = os.getenv("TEST_CAPTCHA_TOKEN", "test-captcha-token")

    url = BASE_URL.rstrip("/") + CONTACT_PATH
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "name": name,
        "email": email,
        "message": message,
        "captchaToken": captcha_token
    }

    created_id = None
    admin_token = os.getenv("ADMIN_BEARER_TOKEN")  # optional, used for cleanup/verification

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request to {url} failed: {e}")

    # Assert status code is 200 or 201
    if resp.status_code not in (200, 201):
        # If server returned validation errors, include them in the assertion message
        body_preview = None
        try:
            body_preview = resp.json()
        except Exception:
            body_preview = resp.text
        raise AssertionError(f"Expected 200 or 201, got {resp.status_code}. Response body: {body_preview}")

    # Try to parse JSON response
    try:
        data = resp.json()
    except ValueError:
        data = None

    # Basic validations on response body: should contain at least acknowledgement fields or id
    if data is None:
        # If no JSON, still accept 200/201 but fail because we can't verify persistence details
        raise AssertionError("Response returned non-JSON body; cannot verify persisted contact details.")
    else:
        # If API returns an id, capture it
        if isinstance(data, dict):
            # Common possible fields: id, contactId, data, message, success
            possible_id_keys = ["id", "contactId", "contact_id", "data", "result"]
            # Check top-level id-like fields
            for k in ("id", "contactId", "contact_id"):
                if k in data and data[k]:
                    created_id = str(data[k])
                    break
            # Some APIs wrap the resource under 'data' or 'result'
            if created_id is None:
                for wrap in ("data", "result"):
                    if wrap in data and isinstance(data[wrap], dict):
                        for k in ("id", "contactId", "contact_id"):
                            if k in data[wrap] and data[wrap][k]:
                                created_id = str(data[wrap][k])
                                break
                        if created_id:
                            break

            # Verify echoed fields if present
            # Accept if the response echoes at least name or email or message
            echoed_ok = False
            for field in ("name", "email", "message"):
                # check top-level
                if field in data and data[field] == (name if field=="name" else email if field=="email" else message):
                    echoed_ok = True
                    break
                # check inside data/result wrapper
                for wrap in ("data", "result"):
                    if wrap in data and isinstance(data[wrap], dict) and field in data[wrap] and data[wrap][field] == (name if field=="name" else email if field=="email" else message):
                        echoed_ok = True
                        break
                if echoed_ok:
                    break

            assert echoed_ok or created_id is not None, "Response did not echo submitted contact fields nor return an id; cannot confirm persistence."

            # If the API provides explicit email-notification indicator, assert it if present
            email_flags = ["emailSent", "notified", "email_sent", "notificationSent"]
            for flag in email_flags:
                if flag in data:
                    # Accept truthy values (True, "queued", etc.) as notification attempted
                    assert data[flag], f"API returned {flag} but it was falsy, expected notification attempt."
                    break

        else:
            # If response JSON is not a dict, it's unexpected
            raise AssertionError("Unexpected JSON response shape; expected an object with id or echoed fields.")

    # If we have an admin token and created_id, attempt to verify persistence via admin GET
    if created_id and admin_token:
        admin_get_url = BASE_URL.rstrip("/") + ADMIN_CONTACT_GET_PATH.format(created_id)
        admin_headers = {
            "Authorization": f"Bearer {admin_token}",
            "Accept": "application/json"
        }
        try:
            resp_get = requests.get(admin_get_url, headers=admin_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Failed to GET admin contact {created_id}: {e}")

        if resp_get.status_code != 200:
            # If admin GET is unauthorized, fail the verification but not the main test
            raise AssertionError(f"Admin GET for contact id {created_id} returned {resp_get.status_code}; expected 200. Body: {resp_get.text}")

        try:
            got = resp_get.json()
        except ValueError:
            raise AssertionError(f"Admin GET returned non-JSON for id {created_id}: {resp_get.text}")

        # Attempt to find the stored email/message/name in response
        found_name = False
        found_email = False
        found_message = False
        search_candidates = [got]
        # unwrap common wrappers
        if isinstance(got, dict):
            for wrap in ("data", "result", "contact"):
                if wrap in got and isinstance(got[wrap], dict):
                    search_candidates.append(got[wrap])
        for candidate in search_candidates:
            if not found_name and isinstance(candidate.get("name"), str) and candidate.get("name") == name:
                found_name = True
            if not found_email and isinstance(candidate.get("email"), str) and candidate.get("email") == email:
                found_email = True
            if not found_message and isinstance(candidate.get("message"), str) and candidate.get("message") == message:
                found_message = True

        assert found_email or found_message or found_name, f"Admin GET did not return the persisted contact fields matching the submission for id {created_id}."

    # If created_id present but no admin token, we still consider main test successful since server acknowledged
    # Test passes if we reach here
    print("TC008 passed: contact submission accepted and basic persistence indicators observed.")
    return True

if __name__ == "__main__":
    try:
        test_post_api_v1_contact_valid_submission()
    except AssertionError as e:
        print(f"Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error during test execution: {e}")
        sys.exit(2)
    sys.exit(0)