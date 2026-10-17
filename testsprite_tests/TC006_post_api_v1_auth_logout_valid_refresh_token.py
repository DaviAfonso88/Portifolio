import os
import sys
import requests
from requests import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def _extract_token_from_json(data, candidates):
    if not isinstance(data, dict):
        return None
    for key in candidates:
        if key in data and isinstance(data[key], str) and data[key].strip():
            return data[key].strip()
    # sometimes nested under "data"
    if "data" in data and isinstance(data["data"], dict):
        for key in candidates:
            if key in data["data"] and isinstance(data["data"][key], str) and data["data"][key].strip():
                return data["data"][key].strip()
    return None


def _get_tokens_from_login_response(resp):
    refresh_candidates = ["refreshToken", "refresh_token", "refresh", "refreshTokenValue"]
    access_candidates = ["accessToken", "access_token", "access", "token"]

    refresh_token = None
    access_token = None

    try:
        body = resp.json()
    except ValueError:
        body = None

    if body:
        refresh_token = _extract_token_from_json(body, refresh_candidates)
        access_token = _extract_token_from_json(body, access_candidates)

    # Check cookies if refresh token not in body
    if not refresh_token:
        for name in refresh_candidates:
            if name in resp.cookies:
                refresh_token = resp.cookies.get(name)
                break

    # As a last resort, check Set-Cookie header string
    if not refresh_token:
        set_cookie = resp.headers.get("Set-Cookie", "")
        for name in refresh_candidates:
            if name + "=" in set_cookie:
                # crude parse
                try:
                    for part in set_cookie.split(","):
                        if name + "=" in part:
                            token_part = part.split(name + "=", 1)[1]
                            token_value = token_part.split(";", 1)[0].strip()
                            if token_value:
                                refresh_token = token_value
                                break
                except Exception:
                    pass
            if refresh_token:
                break

    return access_token, refresh_token


def test_tc006_post_api_v1_auth_logout_valid_refresh_token():
    """
    TC006: POST /api/v1/auth/logout with a valid Refresh Token returns 204 or 200 confirming logout
    and invalidates the token for further refresh attempts.
    """

    # Credentials must be provided via environment variables for the test run.
    # Try common env var names.
    email = os.getenv("TEST_AUTH_EMAIL") or os.getenv("AUTH_EMAIL") or os.getenv("ADMIN_EMAIL")
    password = os.getenv("TEST_AUTH_PASSWORD") or os.getenv("AUTH_PASSWORD") or os.getenv("ADMIN_PASSWORD")

    assert email, "Test requires an auth email set in TEST_AUTH_EMAIL or AUTH_EMAIL or ADMIN_EMAIL"
    assert password, "Test requires an auth password set in TEST_AUTH_PASSWORD or AUTH_PASSWORD or ADMIN_PASSWORD"

    login_url = f"{BASE_URL}/api/v1/auth/login"
    refresh_url = f"{BASE_URL}/api/v1/auth/refresh"
    logout_url = f"{BASE_URL}/api/v1/auth/logout"

    session = requests.Session()
    access_token = None
    refresh_token = None
    logout_performed = False

    try:
        # 1) Login to obtain tokens
        try:
            resp = session.post(login_url, json={"email": email, "password": password}, timeout=TIMEOUT)
        except RequestException as e:
            raise AssertionError(f"Login request failed: {e}")

        assert resp is not None, "No response received from login endpoint"
        if resp.status_code != 200:
            # Accept 200 only for login success as per PRD
            raise AssertionError(f"Expected 200 from login, got {resp.status_code}. Body: {resp.text}")

        access_token, refresh_token = _get_tokens_from_login_response(resp)

        assert refresh_token, f"Login response did not contain a refresh token. Response body: {resp.text}"
        # access_token optional for logout, but capture if present
        # 2) Call logout with the refresh token
        headers = {"Content-Type": "application/json"}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        try:
            resp_logout = session.post(logout_url, json={"refreshToken": refresh_token}, headers=headers, timeout=TIMEOUT)
        except RequestException as e:
            raise AssertionError(f"Logout request failed: {e}")

        assert resp_logout is not None, "No response received from logout endpoint"
        assert resp_logout.status_code in (200, 204), f"Expected 200 or 204 from logout, got {resp_logout.status_code}. Body: {resp_logout.text}"
        logout_performed = True

        # 3) Attempt to refresh using the same refresh token - must be invalidated and return 401
        try:
            resp_refresh = session.post(refresh_url, json={"refreshToken": refresh_token}, timeout=TIMEOUT)
        except RequestException as e:
            raise AssertionError(f"Refresh request failed: {e}")

        assert resp_refresh is not None, "No response received from refresh endpoint"
        # Refresh should fail with 401 after logout per PRD
        assert resp_refresh.status_code == 401, f"Expected 401 when reusing a logged-out refresh token, got {resp_refresh.status_code}. Body: {resp_refresh.text}"

    finally:
        # Ensure we attempt to clean up the session by logging out if not done.
        # This is best-effort cleanup; ignore errors here.
        if refresh_token and not logout_performed:
            try:
                # Try without access token if not available
                cleanup_headers = {"Content-Type": "application/json"}
                if access_token:
                    cleanup_headers["Authorization"] = f"Bearer {access_token}"
                session.post(logout_url, json={"refreshToken": refresh_token}, headers=cleanup_headers, timeout=TIMEOUT)
            except Exception:
                pass


if __name__ == "__main__":
    try:
        test_tc006_post_api_v1_auth_logout_valid_refresh_token()
    except AssertionError as e:
        print("TEST FAILED:", e)
        sys.exit(1)
    except Exception as e:
        print("UNEXPECTED ERROR:", e)
        sys.exit(2)
    else:
        print("TEST PASSED")
        sys.exit(0)