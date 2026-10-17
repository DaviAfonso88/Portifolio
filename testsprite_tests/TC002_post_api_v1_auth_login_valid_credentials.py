import os
import sys
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def _search_keys(obj, keys):
    """
    Recursively search for any of the keys in a nested dict/list structure.
    Returns the first matching value found or None.
    """
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in keys:
                return v
            found = _search_keys(v, keys)
            if found is not None:
                return found
    elif isinstance(obj, list):
        for item in obj:
            found = _search_keys(item, keys)
            if found is not None:
                return found
    return None

def test_post_api_v1_auth_login_valid_credentials():
    """
    TC002: Verify that POST /api/v1/auth/login with valid credentials
    returns 200 with Access Token and Refresh Token.
    """
    url = f"{BASE_URL}/api/v1/auth/login"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    # Credentials: allow override from environment for real test runs
    email = os.getenv("TEST_ADMIN_EMAIL", "admin@example.com")
    password = os.getenv("TEST_ADMIN_PASSWORD", "password123")

    payload = {
        "email": email,
        "password": password
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except RequestException as e:
        raise AssertionError(f"Request to {url} failed: {e}")

    # Status code assertion
    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}, body: {resp.text}"

    # Content-Type should be JSON
    content_type = resp.headers.get("Content-Type", "")
    assert "application/json" in content_type.lower(), f"Expected JSON response, got Content-Type: {content_type}"

    try:
        body = resp.json()
    except ValueError:
        raise AssertionError(f"Response body is not valid JSON: {resp.text}")

    # Look for access and refresh token in common key names and nested structures
    access_token_keys = {"accessToken", "access_token", "token", "accessTokenJwt"}
    refresh_token_keys = {"refreshToken", "refresh_token", "refreshTokenJwt"}

    access_token = _search_keys(body, access_token_keys)
    refresh_token = _search_keys(body, refresh_token_keys)

    # It's possible tokens are returned inside a "data" or "tokens" object; search handled above.
    assert access_token is not None, f"Access token not found in response JSON: {body}"
    assert isinstance(access_token, str) and len(access_token) > 10, "Access token is invalid or too short"

    assert refresh_token is not None, f"Refresh token not found in response JSON: {body}"
    assert isinstance(refresh_token, str) and len(refresh_token) > 10, "Refresh token is invalid or too short"

    # Optionally ensure tokens are not the same
    assert access_token != refresh_token, "Access token and refresh token should not be identical"

    print("TC002 passed: Received valid access and refresh tokens.")

if __name__ == "__main__":
    try:
        test_post_api_v1_auth_login_valid_credentials()
    except AssertionError as e:
        print(f"TC002 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC002 encountered an unexpected error: {e}")
        sys.exit(2)
    sys.exit(0)