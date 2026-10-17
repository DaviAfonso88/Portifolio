import os
import sys
import requests
from requests.exceptions import RequestException

BASE_URL = os.environ.get("BASE_ENDPOINT", "http://localhost:3000")
# Prefer explicit env vars for credentials in CI; fallback to common defaults
EMAIL = os.environ.get("AUTH_EMAIL") or os.environ.get("ADMIN_EMAIL") or "admin@example.com"
PASSWORD = os.environ.get("AUTH_PASSWORD") or os.environ.get("ADMIN_PASSWORD") or "password"
TIMEOUT = 30


def _extract_token(data, candidates):
    """
    Try several common shapes for token fields:
    - top-level keys
    - inside "data" object
    - inside "tokens" object
    Returns first found string token or None.
    """
    if not isinstance(data, dict):
        return None
    # check top-level
    for key in candidates:
        val = data.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    # check nested common containers
    for container in ("data", "tokens", "payload"):
        cont = data.get(container)
        if isinstance(cont, dict):
            for key in candidates:
                val = cont.get(key)
                if isinstance(val, str) and val.strip():
                    return val.strip()
    # look for token values anywhere at depth=1
    for k, v in data.items():
        if isinstance(v, dict):
            for key in candidates:
                val = v.get(key)
                if isinstance(val, str) and val.strip():
                    return val.strip()
    return None


def test_post_api_v1_auth_login_valid_credentials():
    url = f"{BASE_URL.rstrip('/')}/api/v1/auth/login"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    payload = {"email": EMAIL, "password": PASSWORD}

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except RequestException as e:
        raise AssertionError(f"Request to {url} failed: {e}")

    # Basic status code check
    if resp.status_code != 200:
        # Include response body to aid debugging
        body = resp.text
        raise AssertionError(f"Expected status 200 but got {resp.status_code}. Response body: {body}")

    # Content-Type should be JSON
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" not in content_type and "json" not in content_type.lower():
        raise AssertionError(f"Expected JSON response but Content-Type was '{content_type}'")

    try:
        data = resp.json()
    except ValueError:
        raise AssertionError("Response returned 200 but body is not valid JSON")

    # Attempt to extract access and refresh tokens from common keys and structures
    access_candidates = ("accessToken", "access_token", "token", "accessTokenJwt", "access")
    refresh_candidates = ("refreshToken", "refresh_token", "refresh", "refreshTokenJwt")

    access_token = _extract_token(data, access_candidates)
    refresh_token = _extract_token(data, refresh_candidates)

    # Some APIs return tokens with different naming; try nested structures more aggressively
    if not access_token:
        # look for keys named "tokens" that might contain both
        tokens_container = None
        if isinstance(data, dict):
            tokens_container = data.get("tokens") or data.get("token")
        if isinstance(tokens_container, dict):
            access_token = _extract_token(tokens_container, access_candidates)
            refresh_token = _extract_token(tokens_container, refresh_candidates)

    if not access_token:
        raise AssertionError(f"Response JSON did not contain an access token. Response JSON keys: {list(data.keys())}")

    if not refresh_token:
        # Some systems return only access token on login; still require refresh per PRD
        raise AssertionError(f"Response JSON did not contain a refresh token. Response JSON keys: {list(data.keys())}")

    # Basic validation of access token format (JWTs have two dots)
    if isinstance(access_token, str) and access_token.count(".") == 2:
        pass  # good, looks like a JWT
    else:
        # Not all systems use JWT for access token; at minimum ensure it's a non-empty string
        if not isinstance(access_token, str) or not access_token.strip():
            raise AssertionError("Access token is empty or not a string")

    # Ensure refresh token is non-empty
    if not isinstance(refresh_token, str) or not refresh_token.strip():
        raise AssertionError("Refresh token is empty or not a string")

    # If we reached here, the login returned access and refresh tokens as expected
    print("Login successful: access and refresh tokens received.")


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_login_valid_credentials()
        print("TEST PASSED")
        sys.exit(0)
    except AssertionError as e:
        print("TEST FAILED:", e)
        sys.exit(1)
    except Exception as e:
        print("TEST ERROR:", e)
        sys.exit(2)