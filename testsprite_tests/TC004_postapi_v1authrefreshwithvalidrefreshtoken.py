import os
import sys
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def test_post_api_v1_auth_refresh_with_valid_refresh_token():
    """
    TC004 - Verify that POST /api/v1/auth/refresh with a valid Refresh Token returns 200 with a new Access Token.
    Requires environment variables for credentials:
      - AUTH_EMAIL or ADMIN_EMAIL
      - AUTH_PASSWORD or ADMIN_PASSWORD
    """
    email = os.getenv("AUTH_EMAIL") or os.getenv("ADMIN_EMAIL")
    password = os.getenv("AUTH_PASSWORD") or os.getenv("ADMIN_PASSWORD")

    assert email and password, "Test requires AUTH_EMAIL/AUTH_PASSWORD or ADMIN_EMAIL/ADMIN_PASSWORD environment variables."

    login_url = f"{BASE_URL}/api/v1/auth/login"
    refresh_url = f"{BASE_URL}/api/v1/auth/refresh"
    logout_url = f"{BASE_URL}/api/v1/auth/logout"

    session = requests.Session()

    def _extract_token(dct, candidates):
        for k in candidates:
            if k in dct and isinstance(dct[k], str) and dct[k].strip():
                return dct[k]
        return None

    refresh_token = None
    original_access_token = None

    try:
        # 1) Login to obtain refresh token
        login_payload = {"email": email, "password": password}
        try:
            r = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        except RequestException as e:
            raise AssertionError(f"Login request failed: {e}")

        assert r is not None, "No response from login endpoint."
        assert r.status_code == 200, f"Expected 200 from login, got {r.status_code}. Response body: {r.text}"

        try:
            login_json = r.json()
        except ValueError:
            raise AssertionError(f"Login response is not valid JSON. Status: {r.status_code}, Body: {r.text}")

        # Accept common key names for tokens
        refresh_token = _extract_token(login_json, ["refreshToken", "refresh_token", "refresh"])
        original_access_token = _extract_token(login_json, ["accessToken", "access_token", "access", "token"])

        assert refresh_token, f"Login response did not include a refresh token. Body: {login_json}"
        assert original_access_token, f"Login response did not include an access token. Body: {login_json}"

        # 2) Call refresh endpoint with the refresh token
        # Try sending refresh token in JSON body as common key first
        refresh_payloads = [
            {"refreshToken": refresh_token},
            {"refresh_token": refresh_token},
            {"token": refresh_token},
        ]

        refresh_response = None
        refresh_json = None
        refresh_error_details = []

        for payload in refresh_payloads:
            try:
                r2 = session.post(refresh_url, json=payload, timeout=TIMEOUT)
            except RequestException as e:
                refresh_error_details.append(f"RequestException with payload {payload}: {e}")
                continue

            # If we got 200, accept it
            if r2.status_code == 200:
                refresh_response = r2
                break

            # record non-200 for debugging
            refresh_error_details.append(f"Status {r2.status_code} with payload {payload}: {r2.text}")

        if refresh_response is None:
            # As a fallback, try sending the refresh token as Authorization: Bearer <token>
            headers = {"Authorization": f"Bearer {refresh_token}"}
            try:
                r3 = session.post(refresh_url, headers=headers, timeout=TIMEOUT)
                if r3.status_code == 200:
                    refresh_response = r3
                else:
                    refresh_error_details.append(f"Status {r3.status_code} with Authorization header: {r3.text}")
            except RequestException as e:
                refresh_error_details.append(f"RequestException with Authorization header: {e}")

        assert refresh_response is not None, "Refresh attempt failed for all tried payload/header variants. Details: " + " | ".join(refresh_error_details)

        try:
            refresh_json = refresh_response.json()
        except ValueError:
            raise AssertionError(f"Refresh response is not valid JSON. Status: {refresh_response.status_code}, Body: {refresh_response.text}")

        # Extract new access token from response
        new_access_token = _extract_token(refresh_json, ["accessToken", "access_token", "access", "token"])
        new_refresh_token = _extract_token(refresh_json, ["refreshToken", "refresh_token", "refresh"])

        assert refresh_response.status_code == 200, f"Expected 200 from refresh, got {refresh_response.status_code}. Body: {refresh_json}"
        assert new_access_token, f"Refresh response did not include a new access token. Body: {refresh_json}"

        # Optional: ensure the access token changed (if format allows string comparison)
        if isinstance(new_access_token, str) and isinstance(original_access_token, str):
            assert new_access_token != original_access_token, "New access token is identical to the original access token; expected a refreshed token."

        # If a new refresh token was returned, update our refresh_token variable for cleanup
        if new_refresh_token:
            refresh_token = new_refresh_token

        print("TC004 passed: refresh returned 200 with a new access token.")

    finally:
        # Cleanup: attempt to logout/invalidate the refresh token if we have one
        if refresh_token:
            logout_payloads = [
                {"refreshToken": refresh_token},
                {"refresh_token": refresh_token},
                {"token": refresh_token},
            ]
            logged_out = False
            for payload in logout_payloads:
                try:
                    r_logout = session.post(logout_url, json=payload, timeout=TIMEOUT)
                except RequestException:
                    continue
                if r_logout.status_code in (200, 204):
                    logged_out = True
                    break
            if not logged_out:
                # Try Authorization header method as fallback
                try:
                    r_logout2 = session.post(logout_url, headers={"Authorization": f"Bearer {refresh_token}"}, timeout=TIMEOUT)
                    if r_logout2.status_code in (200, 204):
                        logged_out = True
                except RequestException:
                    pass
            if not logged_out:
                # If logout couldn't be confirmed, raise a warning-level assertion (do not fail the test because main assertions already ran)
                print("Warning: unable to confirm logout/revocation of refresh token. Manual cleanup may be required.", file=sys.stderr)


if __name__ == "__main__":
    test_post_api_v1_auth_refresh_with_valid_refresh_token()