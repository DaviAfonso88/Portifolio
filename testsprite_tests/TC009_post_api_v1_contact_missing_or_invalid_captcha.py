import requests
import json
import sys

BASE_URL = "http://localhost:3000"
CONTACT_PATH = "/api/v1/contact"
TIMEOUT = 30


def _response_contains_captcha_error(resp):
    # Try JSON first
    try:
        data = resp.json()
    except ValueError:
        # not JSON, fallback to text search
        return "captcha" in (resp.text or "").lower()

    # Search common keys for captcha mention
    def search_in_obj(obj):
        if obj is None:
            return False
        if isinstance(obj, str):
            return "captcha" in obj.lower()
        if isinstance(obj, dict):
            for v in obj.values():
                if search_in_obj(v):
                    return True
        if isinstance(obj, list):
            for item in obj:
                if search_in_obj(item):
                    return True
        return False

    # Common top-level fields
    for key in ("message", "error", "errors", "detail", "details"):
        if key in data and search_in_obj(data[key]):
            return True

    # Fallback: search entire JSON serialized
    try:
        return "captcha" in json.dumps(data).lower()
    except Exception:
        return False


def test_post_api_v1_contact_missing_or_invalid_captcha():
    url = BASE_URL.rstrip("/") + CONTACT_PATH
    headers = {"Content-Type": "application/json", "Accept": "application/json"}

    payload_base = {
        "name": "Test User",
        "email": "test@example.com",
        "message": "Testing captcha validation handling."
    }

    # Scenario 1: Missing captcha token (omit captcha field)
    try:
        resp_missing = requests.post(url, headers=headers, json=payload_base, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Request failed for missing captcha scenario: {e}") from e

    if resp_missing.status_code not in (400, 403):
        raise AssertionError(
            f"Expected status 400 or 403 for missing captcha, got {resp_missing.status_code}. Response text: {resp_missing.text}"
        )

    if not _response_contains_captcha_error(resp_missing):
        raise AssertionError(
            f"Response for missing captcha did not indicate captcha validation failure. Status: {resp_missing.status_code}, Body: {resp_missing.text}"
        )

    # Scenario 2: Invalid captcha token provided
    payload_invalid = payload_base.copy()
    payload_invalid["captchaToken"] = "invalid-or-expired-token-xyz"

    try:
        resp_invalid = requests.post(url, headers=headers, json=payload_invalid, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Request failed for invalid captcha scenario: {e}") from e

    if resp_invalid.status_code not in (400, 403):
        raise AssertionError(
            f"Expected status 400 or 403 for invalid captcha, got {resp_invalid.status_code}. Response text: {resp_invalid.text}"
        )

    if not _response_contains_captcha_error(resp_invalid):
        raise AssertionError(
            f"Response for invalid captcha did not indicate captcha validation failure. Status: {resp_invalid.status_code}, Body: {resp_invalid.text}"
        )

    print("TC009 passed: POST /api/v1/contact returns 400 or 403 with captcha validation failure for missing/invalid tokens.")


if __name__ == "__main__":
    try:
        test_post_api_v1_contact_missing_or_invalid_captcha()
    except AssertionError as e:
        print("Test failed:", e)
        sys.exit(1)
    except Exception as e:
        print("Unexpected error during test execution:", e)
        sys.exit(2)
    sys.exit(0)