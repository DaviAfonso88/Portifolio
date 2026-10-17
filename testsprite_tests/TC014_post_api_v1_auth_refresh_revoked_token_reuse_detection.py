import os
import sys
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@example.com")
PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "password")


def _extract_tokens(json_data):
    if not isinstance(json_data, dict):
        return None, None
    access = (
        json_data.get("accessToken")
        or json_data.get("access_token")
        or json_data.get("access")
    )
    refresh = (
        json_data.get("refreshToken")
        or json_data.get("refresh_token")
        or json_data.get("refresh")
    )
    return access, refresh


def _post_json(path, payload=None, headers=None):
    url = BASE_URL.rstrip("/") + path
    try:
        r = requests.post(url, json=payload or {}, headers=headers or {}, timeout=TIMEOUT)
        return r
    except RequestException as e:
        raise RuntimeError(f"Request to {url} failed: {e}") from e


def test_post_api_v1_auth_refresh_revoked_token_reuse_detection():
    login_path = "/api/v1/auth/login"
    refresh_path = "/api/v1/auth/refresh"
    logout_path = "/api/v1/auth/logout"

    initial_refresh = None
    rotated_refresh = None
    access_token = None

    # 1) Login to obtain initial refresh token
    try:
        resp = _post_json(login_path, {"email": EMAIL, "password": PASSWORD})
        assert resp is not None, "No response from login endpoint"
        assert resp.status_code == 200, f"Expected 200 from login, got {resp.status_code}, body: {resp.text}"
        data = resp.json()
        access_token, initial_refresh = _extract_tokens(data)
        assert initial_refresh, f"No refresh token returned from login: {data}"
    except Exception:
        # If login fails, abort test as we cannot proceed
        raise

    try:
        # 2) Perform a legitimate refresh using the obtained refresh token.
        # Try sending as JSON body first.
        r1 = _post_json(refresh_path, {"refreshToken": initial_refresh})
        # If the server expects header Authorization: Bearer <token>, try that on non-200
        if r1.status_code == 404 or r1.status_code == 405:
            # fallback to header style
            r1 = _post_json(refresh_path, None, headers={"Authorization": f"Bearer {initial_refresh}"})

        assert r1 is not None, "No response from refresh endpoint"
        assert r1.status_code == 200, f"Expected 200 from first refresh, got {r1.status_code}, body: {r1.text}"
        r1_data = r1.json()
        new_access, new_refresh = _extract_tokens(r1_data)
        # If server rotated refresh tokens, new_refresh should be present and ideally different
        rotated_refresh = new_refresh if new_refresh else initial_refresh
        access_token = new_access or access_token

        # 3) Attempt to reuse the previously-used (initial) refresh token.
        # This should fail with 401 if the system rotates and detects reuse.
        reuse_attempt = _post_json(refresh_path, {"refreshToken": initial_refresh})
        if reuse_attempt.status_code == 404 or reuse_attempt.status_code == 405:
            reuse_attempt = _post_json(refresh_path, None, headers={"Authorization": f"Bearer {initial_refresh}"})

        # We expect reuse to be rejected (401). If the server rotated refresh tokens,
        # reusing the old token should return 401. If the server did not rotate,
        # this request might succeed; in that case we'll revoke via logout and expect 401 after that.
        if rotated_refresh and (rotated_refresh != initial_refresh):
            # Server rotated token: old token reuse must be rejected
            assert reuse_attempt.status_code == 401, (
                f"Expected 401 when reusing rotated refresh token, got {reuse_attempt.status_code}, body: {reuse_attempt.text}"
            )

            # 4) After reuse detection, session family should be revoked.
            # The rotated refresh token should now also be invalid. Verify that.
            family_check = _post_json(refresh_path, {"refreshToken": rotated_refresh})
            if family_check.status_code == 404 or family_check.status_code == 405:
                family_check = _post_json(refresh_path, None, headers={"Authorization": f"Bearer {rotated_refresh}"})
            assert family_check.status_code == 401, (
                f"Expected session family revocation: rotated token should be invalid after reuse detection. "
                f"Got {family_check.status_code}, body: {family_check.text}"
            )
        else:
            # Server did not rotate: perform logout to revoke the token, then ensure reuse fails.
            logout_resp = _post_json(logout_path, {"refreshToken": initial_refresh})
            if logout_resp.status_code not in (200, 204):
                # Try header style
                logout_resp = _post_json(logout_path, None, headers={"Authorization": f"Bearer {initial_refresh}"})
            assert logout_resp.status_code in (200, 204), f"Expected 200/204 from logout, got {logout_resp.status_code}, body: {logout_resp.text}"

            # After logout, refresh with the same token should fail with 401
            post_logout_refresh = _post_json(refresh_path, {"refreshToken": initial_refresh})
            if post_logout_refresh.status_code == 404 or post_logout_refresh.status_code == 405:
                post_logout_refresh = _post_json(refresh_path, None, headers={"Authorization": f"Bearer {initial_refresh}"})
            assert post_logout_refresh.status_code == 401, (
                f"Expected 401 when reusing revoked refresh token after logout, got {post_logout_refresh.status_code}, body: {post_logout_refresh.text}"
            )

    finally:
        # Cleanup: attempt to logout the rotated refresh token if present and not already revoked.
        # Use best-effort; ignore errors during cleanup.
        to_logout = rotated_refresh or initial_refresh
        try:
            if to_logout:
                lr = _post_json(logout_path, {"refreshToken": to_logout})
                if lr.status_code not in (200, 204):
                    # try header form
                    lr = _post_json(logout_path, None, headers={"Authorization": f"Bearer {to_logout}"})
                # We don't assert here; it's cleanup.
        except Exception:
            pass


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_refresh_revoked_token_reuse_detection()
        print("TC014: PASS")
    except AssertionError as e:
        print("TC014: FAIL - AssertionError:", str(e))
        sys.exit(1)
    except Exception as e:
        print("TC014: ERROR - Exception:", str(e))
        sys.exit(2)