import requests
import sys
import json

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def _response_indicates_captcha_failure(resp):
    """
    Heuristic check: look for 'captcha' or 'captcha token' or 'recaptcha' in
    status message, JSON keys, or JSON/string values.
    """
    try:
        text = resp.text or ""
        if "captcha" in text.lower() or "recaptcha" in text.lower():
            return True
        data = resp.json()
    except ValueError:
        # not JSON, rely on text check only
        return "captcha" in (resp.text or "").lower() or "recaptcha" in (resp.text or "").lower()

    def search_in_obj(obj):
        if obj is None:
            return False
        if isinstance(obj, str):
            return "captcha" in obj.lower() or "recaptcha" in obj.lower()
        if isinstance(obj, dict):
            for k, v in obj.items():
                if "captcha" in str(k).lower() or "recaptcha" in str(k).lower():
                    return True
                if search_in_obj(v):
                    return True
            return False
        if isinstance(obj, list):
            for item in obj:
                if search_in_obj(item):
                    return True
            return False
        # other primitive types
        return "captcha" in str(obj).lower() or "recaptcha" in str(obj).lower()

    return search_in_obj(data)


def test_post_api_v1_contact_missing_captcha():
    url = f"{BASE_URL}/api/v1/contact"
    headers = {"Content-Type": "application/json"}

    base_payload = {
        "name": "Test User",
        "email": "test.user@example.com",
        "message": "This is a test message to validate captcha handling."
    }

    try:
        # Scenario 1: Missing captcha token
        resp_missing = requests.post(url, headers=headers, json=base_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed for missing captcha scenario: {e}")

    if resp_missing.status_code not in (400, 403):
        raise AssertionError(
            f"Expected status 400 or 403 for missing captcha, got {resp_missing.status_code}. "
            f"Response body: {resp_missing.text}"
        )

    if not _response_indicates_captcha_failure(resp_missing):
        raise AssertionError(
            f"Response did not indicate captcha validation failure for missing captcha. "
            f"Status: {resp_missing.status_code}, Body: {resp_missing.text}"
        )

    # Scenario 2: Invalid captcha token
    invalid_payload = dict(base_payload)
    # Common names for captcha tokens; send a likely-ignored name by server but include one key.
    invalid_payload["captchaToken"] = "invalid-or-expired-token"

    try:
        resp_invalid = requests.post(url, headers=headers, json=invalid_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed for invalid captcha scenario: {e}")

    if resp_invalid.status_code not in (400, 403):
        raise AssertionError(
            f"Expected status 400 or 403 for invalid captcha, got {resp_invalid.status_code}. "
            f"Response body: {resp_invalid.text}"
        )

    if not _response_indicates_captcha_failure(resp_invalid):
        raise AssertionError(
            f"Response did not indicate captcha validation failure for invalid captcha. "
            f"Status: {resp_invalid.status_code}, Body: {resp_invalid.text}"
        )

    print("TC009 passed: POST /api/v1/contact returned expected errors for missing and invalid captcha.")


if __name__ == "__main__":
    try:
        test_post_api_v1_contact_missing_captcha()
    except AssertionError as e:
        print(f"TC009 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC009 encountered an unexpected error: {e}")
        sys.exit(2)
    sys.exit(0)