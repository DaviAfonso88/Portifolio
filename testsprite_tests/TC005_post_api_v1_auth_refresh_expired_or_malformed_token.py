import requests
import json
import base64
import time

BASE_URL = "http://localhost:3000"
REFRESH_ENDPOINT = f"{BASE_URL}/api/v1/auth/refresh"
TIMEOUT = 30

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def _make_expired_jwt():
    header = {"alg": "HS256", "typ": "JWT"}
    # exp set to a timestamp in the past (e.g., 1 second after epoch)
    payload = {"sub": "test-user", "exp": 1}
    header_b64 = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    # signature is bogus (server will reject either because of invalid sig or expired exp)
    signature = "invalidsignature"
    return f"{header_b64}.{payload_b64}.{signature}"

def test_post_api_v1_auth_refresh_expired_or_malformed_token():
    headers = {"Content-Type": "application/json"}

    test_cases = [
        {"name": "malformed_token", "token": "not.a.valid.token"},
        {"name": "expired_token", "token": _make_expired_jwt()}
    ]

    for case in test_cases:
        payload = {"refreshToken": case["token"]}
        try:
            resp = requests.post(REFRESH_ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
        except requests.exceptions.RequestException as e:
            # Network or connection error should cause the test to fail
            raise AssertionError(f"Request failed for {case['name']}: {e}")

        # Expect HTTP 401 Unauthorized for expired or malformed refresh tokens
        assert resp.status_code == 401, f"Expected 401 for {case['name']}, got {resp.status_code}: {resp.text}"

        # Response should be a JSON authentication error response
        content_type = resp.headers.get("Content-Type", "")
        assert "application/json" in content_type.lower(), f"Expected JSON response for {case['name']}, got Content-Type: {content_type}"

        try:
            body = resp.json()
        except ValueError:
            raise AssertionError(f"Response body is not valid JSON for {case['name']}: {resp.text}")

        # Body should include an authentication/error message key
        expected_keys = {"message", "error", "errors", "detail", "code"}
        assert any(k in body for k in expected_keys), f"Authentication error response for {case['name']} missing expected keys; got: {body}"

if __name__ == "__main__":
    test_post_api_v1_auth_refresh_expired_or_malformed_token()
    print("TC005 passed.")