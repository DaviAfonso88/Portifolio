import requests
import sys

BASE_URL = "http://localhost:3000"
REFRESH_PATH = "/api/v1/auth/refresh"
URL = BASE_URL + REFRESH_PATH
HEADERS = {"Content-Type": "application/json", "Accept": "application/json"}
TIMEOUT = 30


def _assert_unauthorized_response(resp):
    assert resp.status_code == 401, f"Expected 401 Unauthorized, got {resp.status_code}. Body: {resp.text}"
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" in content_type:
        try:
            data = resp.json()
        except ValueError:
            raise AssertionError("Response declared JSON but body is not valid JSON")
        assert isinstance(data, dict), f"Expected JSON object in body, got: {type(data)}"
        # Expect at least one common error field
        if not any(k in data for k in ("error", "message", "code", "detail", "status")):
            raise AssertionError(f"JSON response missing expected error fields. Keys: {list(data.keys())}")
    else:
        # If not JSON, ensure textual indication of authentication error
        text = (resp.text or "").lower()
        if not any(token in text for token in ("token", "invalid", "expired", "unauthoriz", "authentication")):
            raise AssertionError("Non-JSON response does not indicate an authentication error")


def test_post_api_v1_auth_refresh_invalid_token():
    # Two negative scenarios: malformed token and expired-looking token
    malformed_token_payload = {"refreshToken": "this.is.not.a.jwt"}
    expired_token_payload = {
        # syntactically JWT-like but very likely expired (small exp)
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwMCwiaWF0IjoxMDAwfQ.signature"
    }

    # Test malformed token
    try:
        resp_malformed = requests.post(URL, headers=HEADERS, json=malformed_token_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request for malformed token failed: {e}")
    _assert_unauthorized_response(resp_malformed)

    # Test expired token
    try:
        resp_expired = requests.post(URL, headers=HEADERS, json=expired_token_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request for expired token failed: {e}")
    _assert_unauthorized_response(resp_expired)


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_refresh_invalid_token()
    except AssertionError as e:
        print(f"TC005 failed: {e}")
        sys.exit(1)
    print("TC005 passed")