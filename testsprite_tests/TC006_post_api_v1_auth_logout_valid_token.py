import requests
import sys
import traceback
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def _extract_token(payload, keys):
    if not isinstance(payload, dict):
        return None
    # direct keys
    for k in keys:
        if k in payload and isinstance(payload[k], str):
            return payload[k]
    # nested under common containers
    for container in ("data", "tokens", "result"):
        if container in payload and isinstance(payload[container], dict):
            for k in keys:
                if k in payload[container] and isinstance(payload[container][k], str):
                    return payload[container][k]
    # scan any nested dicts at depth 1
    for v in payload.values():
        if isinstance(v, dict):
            for k in keys:
                if k in v and isinstance(v[k], str):
                    return v[k]
    return None


def test_post_api_v1_auth_logout_valid_token():
    login_url = f"{BASE_URL}/api/v1/auth/login"
    logout_url = f"{BASE_URL}/api/v1/auth/logout"
    refresh_url = f"{BASE_URL}/api/v1/auth/refresh"

    # Placeholder credentials - adjust to valid credentials for the environment.
    login_payload = {
        "email": "admin@example.com",
        "password": "password"
    }
    headers = {"Content-Type": "application/json"}

    session = requests.Session()
    refresh_token = None
    access_token = None
    logout_succeeded = False

    try:
        # 1) Obtain tokens via login
        try:
            r = session.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Network error during login: {e}")

        assert r is not None, "No response from login request"
        # Accept 200 for successful login
        if r.status_code != 200:
            # surface response body for debugging
            body = None
            try:
                body = r.json()
            except Exception:
                body = r.text
            raise AssertionError(f"Expected 200 from login, got {r.status_code}. Response: {body}")

        try:
            login_json = r.json()
        except ValueError:
            raise AssertionError("Login response is not valid JSON")

        # Extract tokens with flexible keys
        refresh_token = _extract_token(login_json, ["refreshToken", "refresh_token", "refresh"])
        access_token = _extract_token(login_json, ["accessToken", "access_token", "access"])

        assert refresh_token, f"Login response did not contain a refresh token. Response JSON: {login_json}"
        assert access_token, f"Login response did not contain an access token. Response JSON: {login_json}"

        # 2) Call logout with the valid refresh token
        # Try to send as JSON body { refreshToken: ... } and also include Authorization header with access token
        logout_headers = headers.copy()
        logout_headers["Authorization"] = f"Bearer {access_token}"

        try:
            r_logout = session.post(logout_url, json={"refreshToken": refresh_token}, headers=logout_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Network error during logout: {e}")

        assert r_logout is not None, "No response from logout request"

        # Accept either 204 No Content or 200 OK
        if r_logout.status_code not in (200, 204):
            body = None
            try:
                body = r_logout.json()
            except Exception:
                body = r_logout.text
            raise AssertionError(f"Expected 200 or 204 from logout, got {r_logout.status_code}. Response: {body}")

        logout_succeeded = True

        # 3) Attempt to refresh using the same refresh token, expecting 401 (invalidated token)
        try:
            r_refresh = session.post(refresh_url, json={"refreshToken": refresh_token}, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Network error during refresh attempt after logout: {e}")

        assert r_refresh is not None, "No response from refresh request after logout"

        # Expect 401 unauthorized for invalidated token. Some implementations might return 403; accept 401 as per PRD.
        if r_refresh.status_code != 401:
            # If the server returns 200, that's a failure (token was not invalidated)
            body = None
            try:
                body = r_refresh.json()
            except Exception:
                body = r_refresh.text
            raise AssertionError(f"Expected 401 from refresh using invalidated token, got {r_refresh.status_code}. Response: {body}")

        print("Test passed: logout returned 200/204 and refresh with the same token returned 401 (invalidated).")

    finally:
        # Best-effort cleanup: if logout did not succeed, try to invalidate the refresh token again.
        if refresh_token and not logout_succeeded:
            try:
                # Attempt logout without access token as a last resort
                session.post(logout_url, json={"refreshToken": refresh_token}, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_logout_valid_token()
    except AssertionError:
        traceback.print_exc()
        sys.exit(1)
    except Exception:
        traceback.print_exc()
        sys.exit(2)