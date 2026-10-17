import os
import sys
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
LOGIN_PATH = "/api/v1/auth/login"
LOGOUT_PATH = "/api/v1/auth/logout"
REFRESH_PATH = "/api/v1/auth/refresh"
TIMEOUT = 30


def _extract_token(data, *keys):
    for k in keys:
        if k in data and data[k]:
            return data[k]
    return None


def test_post_api_v1_auth_logout_valid_token():
    """
    Test case TC006:
    - Login with credentials from environment to obtain access and refresh tokens.
    - POST /api/v1/auth/logout with the valid refresh token -> expect 200 or 204.
    - POST /api/v1/auth/refresh with the same refresh token -> expect 401 (invalidated).
    """

    email = os.getenv("AUTH_EMAIL")
    password = os.getenv("AUTH_PASSWORD")
    if not email or not password:
        raise AssertionError(
            "AUTH_EMAIL and AUTH_PASSWORD environment variables must be set to run this test."
        )

    headers = {"Content-Type": "application/json"}

    # 1) Login to obtain tokens
    login_url = BASE_URL + LOGIN_PATH
    try:
        resp = requests.post(
            login_url,
            json={"email": email, "password": password},
            headers=headers,
            timeout=TIMEOUT,
        )
    except RequestException as e:
        raise AssertionError(f"Login request failed: {e}")

    assert resp.status_code == 200, f"Expected 200 from login, got {resp.status_code}. Body: {resp.text}"

    try:
        login_data = resp.json()
    except ValueError:
        raise AssertionError(f"Login response is not valid JSON: {resp.text}")

    # Accept multiple possible token key names
    refresh_token = _extract_token(
        login_data, "refreshToken", "refresh_token", "refresh", "refreshTokenRaw"
    )
    access_token = _extract_token(
        login_data, "accessToken", "access_token", "token", "accessTokenRaw"
    )

    assert refresh_token, f"No refresh token found in login response: {login_data}"

    logout_url = BASE_URL + LOGOUT_PATH
    refresh_url = BASE_URL + REFRESH_PATH

    logout_response = None
    # Use try/finally to ensure we attempt logout for cleanup if needed
    try:
        logout_headers = headers.copy()
        if access_token:
            logout_headers["Authorization"] = f"Bearer {access_token}"

        # 2) Logout using the refresh token
        try:
            logout_response = requests.post(
                logout_url,
                json={"refreshToken": refresh_token},
                headers=logout_headers,
                timeout=TIMEOUT,
            )
        except RequestException as e:
            raise AssertionError(f"Logout request failed: {e}")

        assert logout_response.status_code in (200, 204), (
            f"Expected 200 or 204 from logout, got {logout_response.status_code}. Body: {logout_response.text}"
        )

        # 3) Attempt to refresh with the same refresh token; should be invalidated (401)
        try:
            refresh_resp = requests.post(
                refresh_url,
                json={"refreshToken": refresh_token},
                headers=headers,
                timeout=TIMEOUT,
            )
        except RequestException as e:
            raise AssertionError(f"Refresh request failed: {e}")

        assert (
            refresh_resp.status_code == 401
        ), f"Expected 401 from refresh after logout, got {refresh_resp.status_code}. Body: {refresh_resp.text}"

    finally:
        # Best-effort cleanup: ensure session is logged out (ignore errors)
        try:
            if not logout_response or logout_response.status_code not in (200, 204):
                cleanup_headers = headers.copy()
                if access_token:
                    cleanup_headers["Authorization"] = f"Bearer {access_token}"
                requests.post(
                    logout_url,
                    json={"refreshToken": refresh_token},
                    headers=cleanup_headers,
                    timeout=TIMEOUT,
                )
        except Exception:
            pass


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_logout_valid_token()
    except AssertionError as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"UNEXPECTED ERROR: {e}")
        sys.exit(2)
    else:
        print("TEST PASSED")
        sys.exit(0)