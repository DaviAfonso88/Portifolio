import os
import uuid
import requests
import sys
from typing import Any, Dict

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def _extract_token(json_obj: Any) -> str | None:
    """
    Try to find an access token string in common locations/names.
    """
    if not isinstance(json_obj, (dict, list)):
        return None
    keys_to_try = ["accessToken", "access_token", "token", "accessTokenJwt", "access"]
    if isinstance(json_obj, dict):
        for k in keys_to_try:
            if k in json_obj and isinstance(json_obj[k], str):
                return json_obj[k]
        # try common nested shapes
        for k in ("data", "tokens", "result", "payload"):
            if k in json_obj:
                found = _extract_token(json_obj[k])
                if found:
                    return found
        # look for any string value that looks like JWT (3 parts separated by .)
        for v in json_obj.values():
            if isinstance(v, str) and v.count(".") == 2:
                return v
            if isinstance(v, dict):
                found = _extract_token(v)
                if found:
                    return found
    else:  # list
        for item in json_obj:
            found = _extract_token(item)
            if found:
                return found
    return None


def _extract_id(json_obj: Any) -> str | None:
    """
    Try to find an id string in common locations/names.
    """
    if not isinstance(json_obj, (dict, list)):
        return None
    if isinstance(json_obj, dict):
        for k in ("id", "_id", "uuid", "postId", "post_id"):
            if k in json_obj and (isinstance(json_obj[k], str) or isinstance(json_obj[k], int)):
                return str(json_obj[k])
        for k in ("data", "result", "post", "payload"):
            if k in json_obj:
                found = _extract_id(json_obj[k])
                if found:
                    return found
        for v in json_obj.values():
            if isinstance(v, dict) or isinstance(v, list):
                found = _extract_id(v)
                if found:
                    return found
    else:  # list
        for item in json_obj:
            found = _extract_id(item)
            if found:
                return found
    return None


def test_get_api_v1_admin_posts_id_versions_unauthorized_TC012():
    """
    TC012: Verify that GET /api/v1/admin/posts/:id/versions without Bearer token returns 401 Unauthorized.
    If possible, create a test post (requires ADMIN_EMAIL and ADMIN_PASSWORD env vars), then query versions without token.
    Ensure cleanup of created post in finally block.
    """
    created_post_id = None
    access_token = None
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    try:
        # If admin credentials available, attempt to login and create a post to get a valid id to test against.
        if admin_email and admin_password:
            login_url = f"{BASE_URL}/api/v1/auth/login"
            login_payload = {"email": admin_email, "password": admin_password}
            login_headers = {"Accept": "application/json", "Content-Type": "application/json"}
            resp = requests.post(login_url, json=login_payload, headers=login_headers, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Expected 200 from login, got {resp.status_code}: {resp.text}"
            login_json = resp.json()
            access_token = _extract_token(login_json)
            assert access_token, f"Could not extract access token from login response: {login_json}"

            # Create a new post
            create_url = f"{BASE_URL}/api/v1/admin/posts"
            slug = f"test-tc012-{uuid.uuid4().hex[:8]}"
            post_payload: Dict[str, Any] = {
                "title": "TC012 unauthorized versions test",
                "slug": slug,
                "summary": "Temporary post for TC012",
                "body": "This is a temporary post created by an automated test.",
                # status or locale may be required; include typical fields
                "status": "draft",
            }
            create_headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            }
            resp = requests.post(create_url, json=post_payload, headers=create_headers, timeout=TIMEOUT)
            assert resp.status_code in (200, 201), f"Expected 200/201 from create post, got {resp.status_code}: {resp.text}"
            create_json = resp.json()
            created_post_id = _extract_id(create_json)
            assert created_post_id, f"Could not extract post id from create response: {create_json}"
        else:
            # No credentials: use a random UUID as the id to test unauthorized access.
            created_post_id = str(uuid.uuid4())

        # Perform the GET /api/v1/admin/posts/:id/versions without Authorization header
        versions_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}/versions"
        headers = {"Accept": "application/json"}
        resp = requests.get(versions_url, headers=headers, timeout=TIMEOUT)

        # Assert that the response is 401 Unauthorized
        assert resp.status_code == 401, f"Expected 401 Unauthorized when no bearer token is provided, got {resp.status_code}. Response body: {resp.text}"

        # Optionally, check common error shape
        try:
            body = resp.json()
            # Commonly there will be an error message or code
            if isinstance(body, dict):
                assert any(k in body for k in ("error", "message", "code", "errors")), "Response JSON does not contain typical error fields"
        except ValueError:
            # Not JSON — still acceptable as long as status code is 401
            pass

    finally:
        # Cleanup: if we created a post, attempt to delete it using admin token
        if created_post_id and admin_email and admin_password and access_token:
            delete_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}/delete"
            delete_headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            }
            # Try a couple of payload shapes that the API might accept
            delete_payloads = [{}, {"confirm": True}, {"confirmed": True}, {"force": True}]
            delete_succeeded = False
            for payload in delete_payloads:
                try:
                    resp = requests.post(delete_url, json=payload, headers=delete_headers, timeout=TIMEOUT)
                    if resp.status_code in (200, 202, 204):
                        delete_succeeded = True
                        break
                except Exception:
                    # ignore and try next payload
                    pass
            if not delete_succeeded:
                # Attempt a fallback GET to the admin posts endpoint to attempt direct cleanup if supported
                try:
                    fallback_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}"
                    resp = requests.delete(fallback_url, headers=delete_headers, timeout=TIMEOUT)
                    if resp.status_code in (200, 202, 204):
                        delete_succeeded = True
                except Exception:
                    pass
            # If deletion didn't succeed, raise a warning via assertion so the test run is aware
            assert delete_succeeded, f"Cleanup failed: could not delete post with id {created_post_id}. Manual cleanup may be required."

    print("TC012 passed: GET /api/v1/admin/posts/:id/versions without Bearer token returned 401 Unauthorized.")


if __name__ == "__main__":
    try:
        test_get_api_v1_admin_posts_id_versions_unauthorized_TC012()
    except AssertionError as e:
        print(f"AssertionError: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(2)
    sys.exit(0)