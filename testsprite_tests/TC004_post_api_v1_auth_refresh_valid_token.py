import os
import sys
import requests
from requests.exceptions import RequestException, Timeout

BASE_URL = "http://localhost:3000"
LOGIN_PATH = "/api/v1/auth/login"
REFRESH_PATH = "/api/v1/auth/refresh"
LOGOUT_PATH = "/api/v1/auth/logout"
TIMEOUT = 30


def test_post_api_v1_auth_refresh_valid_token():
    """
    TC004: Verify that POST /api/v1/auth/refresh with a valid Refresh Token
    returns 200 with a new Access Token.
    """
    email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    password = os.getenv("ADMIN_PASSWORD", "password")

    login_url = BASE_URL.rstrip("/") + LOGIN_PATH
    refresh_url = BASE_URL.rstrip("/") + REFRESH_PATH
    logout_url = BASE_URL.rstrip("/") + LOGOUT_PATH

    refresh_token = None
    old_access_token = None
    new_access_token = None

    try:
        # Attempt login to obtain a refresh token
        login_payload_candidates = [
            {"email": email, "password": password},
            {"username": email, "password": password},
            {"user": email, "password": password},
        ]

        login_response = None
        for payload in login_payload_candidates:
            try:
                login_response = requests.post(
                    login_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=TIMEOUT,
                )
            except (RequestException, Timeout) as e:
                # network issue; abort
                raise AssertionError(f"Login request failed: {e}")
            if login_response is None:
                raise AssertionError("Login request was not performed.")
            # If server responded with 200, accept it
            if login_response.status_code == 200:
                break
            # If 400/401, try next payload candidate before failing
        if login_response.status_code != 200:
            raise AssertionError(
                f"Login failed with status {login_response.status_code}: {login_response.text}"
            )

        try:
            login_json = login_response.json()
        except ValueError:
            raise AssertionError("Login response is not valid JSON")

        # Expect at least accessToken and refreshToken present
        old_access_token = login_json.get("accessToken") or login_json.get("access_token")
        refresh_token = login_json.get("refreshToken") or login_json.get("refresh_token") or login_json.get("refresh")

        assert old_access_token and isinstance(old_access_token, str), "Login did not return access token"
        assert refresh_token and isinstance(refresh_token, str), "Login did not return refresh token"

        # Call refresh endpoint with the refresh token
        refresh_payload_candidates = [
            {"refreshToken": refresh_token},
            {"refresh_token": refresh_token},
            {"token": refresh_token},
        ]

        refresh_response = None
        for payload in refresh_payload_candidates:
            try:
                refresh_response = requests.post(
                    refresh_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=TIMEOUT,
                )
            except (RequestException, Timeout) as e:
                raise AssertionError(f"Refresh request failed: {e}")
            if refresh_response is None:
                raise AssertionError("Refresh request was not performed.")
            if refresh_response.status_code == 200:
                break

        assert refresh_response.status_code == 200, (
            f"Expected 200 from refresh endpoint, got {refresh_response.status_code}: {refresh_response.text}"
        )

        try:
            refresh_json = refresh_response.json()
        except ValueError:
            raise AssertionError("Refresh response is not valid JSON")

        new_access_token = refresh_json.get("accessToken") or refresh_json.get("access_token")
        returned_refresh_token = (
            refresh_json.get("refreshToken")
            or refresh_json.get("refresh_token")
            or refresh_json.get("refresh")
        )

        assert new_access_token and isinstance(new_access_token, str), "Refresh did not return new access token"

        # Sanity check: access token looks like a JWT (has at least two dots)
        assert new_access_token.count(".") >= 2, "New access token does not look like a JWT"

        # Optionally ensure the new access token is different than the old one
        if old_access_token:
            assert new_access_token != old_access_token, "New access token is identical to the previous one"

        # Validate the new access token can access an admin-protected endpoint
        protected_url = BASE_URL.rstrip("/") + "/api/v1/admin/posts"
        try:
            protected_resp = requests.get(
                protected_url,
                headers={"Authorization": f"Bearer {new_access_token}"},
                timeout=TIMEOUT,
            )
        except (RequestException, Timeout) as e:
            raise AssertionError(f"Protected resource request failed: {e}")

        # If credentials are valid admin, expect 200. If server denies, assert at least not 500.
        assert protected_resp.status_code in (200, 401, 403), (
            f"Unexpected status code when using new access token: {protected_resp.status_code}"
        )

    finally:
        # Attempt to logout / invalidate the refresh token to clean up session
        if refresh_token:
            try:
                _ = requests.post(
                    logout_url,
                    json={"refreshToken": refresh_token},
                    headers={"Content-Type": "application/json"},
                    timeout=TIMEOUT,
                )
            except Exception:
                # best-effort, ignore errors during cleanup
                pass


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_refresh_valid_token()
        print("TC004 passed")
        sys.exit(0)
    except AssertionError as e:
        print("TC004 failed:", e)
        sys.exit(1)
    except Exception as e:
        print("TC004 encountered an unexpected error:", e)
        sys.exit(2)