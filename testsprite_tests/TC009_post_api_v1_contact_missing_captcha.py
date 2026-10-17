import requests
import sys

BASE_URL = "http://localhost:3000"
ENDPOINT = "/api/v1/contact"
URL = BASE_URL + ENDPOINT
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def _response_indicates_captcha_failure(resp):
    # Try to interpret JSON body
    try:
        body = resp.json()
    except ValueError:
        body = None

    # Check JSON for captcha-related keys/values
    if isinstance(body, dict):
        # Look through keys and string values for "captcha"
        for k, v in body.items():
            if isinstance(k, str) and "captcha" in k.lower():
                return True
            if isinstance(v, str) and "captcha" in v.lower():
                return True
            # nested structures
            if isinstance(v, dict) or isinstance(v, list):
                text = str(v).lower()
                if "captcha" in text:
                    return True

    # Fallback: check raw text
    text = resp.text or ""
    if "captcha" in text.lower() or "captcha token" in text.lower() or "captcha validation" in text.lower():
        return True

    return False


def test_post_api_v1_contact_missing_captcha():
    # Base payload (valid otherwise)
    base_payload = {
        "name": "Test User",
        "email": "test.user@example.com",
        "message": "This is a test message for captcha validation."
    }

    # Scenario 1: Missing captcha token (omit the field)
    try:
        resp = requests.post(URL, json=base_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed for missing captcha scenario: {e}")

    assert resp.status_code in (400, 403), (
        f"Expected 400 or 403 for missing captcha, got {resp.status_code}. Response text: {resp.text}"
    )
    assert _response_indicates_captcha_failure(resp), (
        f"Response did not indicate captcha validation failure for missing captcha. Status: {resp.status_code}, Body: {resp.text}"
    )

    # Scenario 2: Invalid captcha token provided
    invalid_payload = dict(base_payload)
    invalid_payload["captchaToken"] = "invalid-or-expired-token-12345"
    try:
        resp2 = requests.post(URL, json=invalid_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed for invalid captcha scenario: {e}")

    assert resp2.status_code in (400, 403), (
        f"Expected 400 or 403 for invalid captcha, got {resp2.status_code}. Response text: {resp2.text}"
    )
    assert _response_indicates_captcha_failure(resp2), (
        f"Response did not indicate captcha validation failure for invalid captcha. Status: {resp2.status_code}, Body: {resp2.text}"
    )

    print("TC009 passed: Missing and invalid captcha scenarios returned expected errors.")


if __name__ == "__main__":
    try:
        test_post_api_v1_contact_missing_captcha()
    except AssertionError as e:
        print("TC009 failed:", e)
        sys.exit(1)
    except Exception as e:
        print("TC009 encountered an unexpected error:", e)
        sys.exit(2)
    sys.exit(0)