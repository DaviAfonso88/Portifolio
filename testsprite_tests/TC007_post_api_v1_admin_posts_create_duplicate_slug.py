import os
import sys
import uuid
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def login_get_tokens(email: str, password: str):
    url = f"{BASE_URL}/api/v1/auth/login"
    payload = {"email": email, "password": password}
    try:
        r = requests.post(url, json=payload, timeout=TIMEOUT)
    except RequestException as e:
        raise RuntimeError(f"Login request failed: {e}") from e

    if r.status_code != 200:
        raise AssertionError(f"Login failed, expected 200 but got {r.status_code}: {r.text}")

    try:
        data = r.json()
    except ValueError:
        raise AssertionError(f"Login response is not JSON: {r.text}")

    access = data.get("accessToken") or data.get("access_token") or data.get("access")
    refresh = data.get("refreshToken") or data.get("refresh_token") or data.get("refresh")
    if not access:
        raise AssertionError(f"Access token missing in login response: {data}")

    return access, refresh

def create_post(access_token: str, post_payload: dict):
    url = f"{BASE_URL}/api/v1/admin/posts"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    try:
        r = requests.post(url, json=post_payload, headers=headers, timeout=TIMEOUT)
    except RequestException as e:
        raise RuntimeError(f"Create post request failed: {e}") from e
    return r

def delete_post(access_token: str, post_id: str):
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    # Try the documented delete-confirm flow first, then fallback to DELETE
    try:
        url_confirm = f"{BASE_URL}/api/v1/admin/posts/{post_id}/delete"
        r = requests.post(url_confirm, json={"confirmed": True}, headers=headers, timeout=TIMEOUT)
        if r.status_code in (200, 204):
            return r
    except RequestException:
        pass

    try:
        url_delete = f"{BASE_URL}/api/v1/admin/posts/{post_id}"
        r2 = requests.delete(url_delete, headers=headers, timeout=TIMEOUT)
        return r2
    except RequestException as e:
        raise RuntimeError(f"Delete post request failed: {e}") from e

def test_post_api_v1_admin_posts_create_duplicate_slug():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        raise RuntimeError("ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set for admin authentication")

    access_token, refresh_token = login_get_tokens(admin_email, admin_password)

    unique_slug = f"test-duplicate-slug-{uuid.uuid4().hex[:8]}"
    base_payload = {
        "title": "Test Duplicate Slug",
        "slug": unique_slug,
        "summary": "Summary for duplicate slug test",
        "body": "This is a test body for duplicate slug validation.",
        "status": "draft"
    }

    first_post_id = None
    second_post_id = None

    try:
        # Create the first post - should succeed (201 or 200 depending on implementation)
        resp1 = create_post(access_token, base_payload)
        assert resp1.status_code in (200, 201), f"Expected 200 or 201 creating first post, got {resp1.status_code}: {resp1.text}"
        try:
            data1 = resp1.json()
        except ValueError:
            raise AssertionError(f"First create response not JSON: {resp1.text}")

        # Extract id if present
        first_post_id = data1.get("id") or data1.get("_id") or str(data1.get("data", {}).get("id", "")) or None
        if not first_post_id:
            # try common nested patterns
            if isinstance(data1, dict):
                # try to find an integer/string id anywhere
                for v in ("id", "_id", "postId"):
                    if v in data1:
                        first_post_id = data1[v]
                        break

        assert first_post_id, f"Could not determine created post id from response: {data1}"

        # Attempt to create a second post with the same slug - should fail with 409 or validation error
        resp2 = create_post(access_token, base_payload)
        # Acceptable error codes: 409 Conflict, 400 Bad Request, 422 Unprocessable Entity
        if resp2.status_code in (409, 400, 422):
            # Validate response body contains indication about slug conflict
            text = ""
            try:
                json_body = resp2.json()
                text = str(json_body)
            except ValueError:
                text = resp2.text or ""
            lowered = text.lower()
            assert ("slug" in lowered and ("already" in lowered or "in use" in lowered or "duplicate" in lowered)) or resp2.status_code == 409, \
                f"Expected slug-related validation or 409 for duplicate slug, got {resp2.status_code} and body: {text}"
        elif resp2.status_code in (200, 201):
            # If API unexpectedly allowed creation, capture id and fail test after cleanup
            try:
                data2 = resp2.json()
            except ValueError:
                raise AssertionError(f"Second create succeeded unexpectedly and returned non-JSON: {resp2.text}")
            second_post_id = data2.get("id") or data2.get("_id") or str(data2.get("data", {}).get("id", "")) or None
            # Fail because duplicate slug should not be allowed
            raise AssertionError(f"API allowed creation of a second post with duplicate slug. Second post id: {second_post_id}")
        else:
            # Unexpected status code
            raise AssertionError(f"Unexpected status code for duplicate-slug attempt: {resp2.status_code}, body: {resp2.text}")

    finally:
        # Cleanup created posts if any
        cleanup_errors = []
        if second_post_id:
            try:
                r = delete_post(access_token, second_post_id)
                if r is None or r.status_code not in (200, 204):
                    cleanup_errors.append(f"Failed to delete second post {second_post_id}: status {getattr(r, 'status_code', None)}")
            except Exception as e:
                cleanup_errors.append(f"Error deleting second post {second_post_id}: {e}")

        if first_post_id:
            try:
                r = delete_post(access_token, first_post_id)
                if r is None or r.status_code not in (200, 204):
                    cleanup_errors.append(f"Failed to delete first post {first_post_id}: status {getattr(r, 'status_code', None)}")
            except Exception as e:
                cleanup_errors.append(f"Error deleting first post {first_post_id}: {e}")

        if cleanup_errors:
            # If cleanup had issues, surface an error
            raise RuntimeError("Cleanup errors: " + "; ".join(cleanup_errors))

if __name__ == "__main__":
    try:
        test_post_api_v1_admin_posts_create_duplicate_slug()
        print("TC007 passed")
    except AssertionError as e:
        print("TC007 failed:", e)
        sys.exit(1)
    except Exception as ex:
        print("TC007 error:", ex)
        sys.exit(2)