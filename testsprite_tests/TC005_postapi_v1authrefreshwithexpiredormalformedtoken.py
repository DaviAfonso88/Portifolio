import requests
import base64
import json
import time
import sys

BASE_URL = "http://localhost:3000"
REFRESH_PATH = "/api/v1/auth/refresh"
TIMEOUT = 30

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def test_postapi_v1authrefreshwithexpiredormalformedtoken():
    url = BASE_URL.rstrip("/") + REFRESH_PATH
    headers = {"Content-Type": "application/json", "Accept": "application/json"}

    # Build a JWT-looking token with an expired exp claim (not properly signed)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": "test-user", "exp": int(time.time()) - 3600}  # expired 1 hour ago
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    fake_signature = "invalidsignature"
    expired_like_token = f"{header_b64}.{payload_b64}.{fake_signature}"

    # Malformed token (not JWT format)
    malformed_token = "this_is_not_a.valid.jwt.token"

    test_tokens = [
        ("expired_like_token", expired_like_token),
        ("malformed_token", malformed_token),
    ]

    for name, token in test_tokens:
        payload_json = {"refreshToken": token}
        try:
            resp = requests.post(url, headers=headers, json=payload_json, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"HTTP request failed for {name}: {e}") from e

        # Assert unauthorized status
        assert resp.status_code == 401, f"{name}: expected 401 Unauthorized, got {resp.status_code}. Body: {resp.text}"

        # Validate response body - prefer JSON error object, but accept non-empty plain text
        content_type = resp.headers.get("Content-Type", "")
        if "application/json" in content_type:
            try:
                body = resp.json()
            except ValueError:
                raise AssertionError(f"{name}: response Content-Type is application/json but body is not valid JSON. Raw: {resp.text}")
            if isinstance(body, dict):
                allowed_error_keys = {"error", "message", "detail", "code", "status", "errors"}
                if not any(k in body for k in allowed_error_keys):
                    raise AssertionError(f"{name}: JSON body did not contain expected error fields. Body keys: {list(body.keys())}")
            else:
                # non-dict JSON (e.g., string) is acceptable as long as non-empty
                assert body, f"{name}: empty JSON body"
        else:
            # Not JSON: ensure there's at least some error text returned
            assert resp.text and resp.text.strip(), f"{name}: expected error body text for 401 response, got empty body"

    print("TC005 passed: POST /api/v1/auth/refresh returns 401 for expired and malformed tokens")

if __name__ == "__main__":
    try:
        test_postapi_v1authrefreshwithexpiredormalformedtoken()
    except AssertionError as e:
        print(f"TC005 failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"TC005 encountered an unexpected error: {e}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)