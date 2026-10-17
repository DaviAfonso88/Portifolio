import os
import sys
import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_v1_auth_refresh_valid_token():
    """
    Test case TC004:
    Verify that POST /api/v1/auth/refresh with a valid Refresh Token returns 200 with a new Access Token.
    """
    login_url = f"{BASE_URL}/api/v1/auth/login"
    refresh_url = f"{BASE_URL}/api/v1/auth/refresh"
    logout_url = f"{BASE_URL}/api/v1/auth/logout"

    headers = {
        "Content-Type": "application/json",
        "X-Server-Mode": "production"
    }

    # Credentials: prefer environment variables for CI; fallback to common defaults
    email = os.environ.get("TEST_ADMIN_EMAIL", "admin@example.com")
    password = os.environ.get("TEST_ADMIN_PASSWORD", "password")

    refresh_token = None
    initial_access_token = None

    try:
        # Step 1: Login to obtain Access and Refresh tokens
        login_payload = {"email": email, "password": password}
        try:
            r = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Login request failed: {e}")

        assert r is not None, "No response from login endpoint"
        assert r.status_code == 200, f"Expected 200 from login, got {r.status_code}, body: {r.text}"

        try:
            login_json = r.json()
        except ValueError:
            raise AssertionError(f"Login response is not valid JSON: {r.text}")

        # Accept common token field names
        refresh_token = login_json.get("refreshToken") or login_json.get("refresh_token") or login_json.get("refresh")
        initial_access_token = login_json.get("accessToken") or login_json.get("access_token") or login_json.get("access")

        assert isinstance(refresh_token, str) and refresh_token.strip(), f"Refresh token missing or invalid in login response: {login_json}"
        assert isinstance(initial_access_token, str) and initial_access_token.strip(), f"Access token missing or invalid in login response: {login_json}"

        # Step 2: Call refresh endpoint with the refresh token
        # Send token in JSON body and also as Authorization bearer header to maximize compatibility
        refresh_headers = headers.copy()
        refresh_headers["Authorization"] = f"Bearer {refresh_token}"

        refresh_payload = {"refreshToken": refresh_token}
        try:
            r2 = requests.post(refresh_url, json=refresh_payload, headers=refresh_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Refresh request failed: {e}")

        assert r2 is not None, "No response from refresh endpoint"
        assert r2.status_code == 200, f"Expected 200 from refresh, got {r2.status_code}, body: {r2.text}"

        try:
            refresh_json = r2.json()
        except ValueError:
            raise AssertionError(f"Refresh response is not valid JSON: {r2.text}")

        new_access_token = refresh_json.get("accessToken") or refresh_json.get("access_token") or refresh_json.get("access")
        assert isinstance(new_access_token, str) and new_access_token.strip(), f"New access token missing or invalid in refresh response: {refresh_json}"

        # Ensure the new access token is different from the initial access token (typical behavior)
        if initial_access_token:
            assert new_access_token != initial_access_token, "New access token should differ from the initial access token"

        # Success if reached here
        print("TC004 passed: refresh returned 200 with a new access token")

    finally:
        # Attempt to logout/invalidate the refresh token to clean up session if available
        if refresh_token:
            logout_payload = {"refreshToken": refresh_token}
            try:
                requests.post(logout_url, json=logout_payload, headers=headers, timeout=TIMEOUT)
            except requests.RequestException:
                # Do not raise further; cleanup best-effort
                pass

if __name__ == "__main__":
    try:
        test_post_api_v1_auth_refresh_valid_token()
    except AssertionError as e:
        print(f"Test failed: {e}")
        sys.exit(1)
    except Exception as exc:
        print(f"Unexpected error during test execution: {exc}")
        sys.exit(2)
    else:
        sys.exit(0)