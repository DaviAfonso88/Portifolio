import os
import sys
import uuid
import time
import requests

BASE_URL = os.getenv("BASE_ENDPOINT", "http://localhost:3000")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")
TIMEOUT = 30


def _extract_access_token(resp_json):
    # Accept multiple common shapes
    if not isinstance(resp_json, dict):
        return None
    for key in ("accessToken", "access_token", "token", "accessTokenRaw"):
        if key in resp_json and isinstance(resp_json[key], str):
            return resp_json[key]
    # nested tokens object
    if "tokens" in resp_json and isinstance(resp_json["tokens"], dict):
        for key in ("accessToken", "access_token", "token"):
            if key in resp_json["tokens"] and isinstance(resp_json["tokens"][key], str):
                return resp_json["tokens"][key]
    return None


def test_get_admin_post_versions_valid():
    session = requests.Session()
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
    access_token = None
    created_post_id = None

    try:
        # 1) Authenticate - POST /api/v1/auth/login
        login_url = f"{BASE_URL}/api/v1/auth/login"
        login_payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        login_resp = session.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: status {login_resp.status_code}, body: {login_resp.text}"
        login_json = login_resp.json()
        access_token = _extract_access_token(login_json)
        assert access_token, f"Access token not found in login response: {login_json}"

        auth_headers = {**headers, "Authorization": f"Bearer {access_token}"}

        # 2) Create a new post - POST /api/v1/admin/posts
        create_url = f"{BASE_URL}/api/v1/admin/posts"
        unique_slug = f"test-post-{uuid.uuid4().hex[:8]}"
        create_payload = {
            "title": "Test Post for Versions",
            "slug": unique_slug,
            "summary": "Summary for versions test",
            "body": "Initial body content",
            "locale": "en",
            "status": "draft"
        }
        create_resp = session.post(create_url, json=create_payload, headers=auth_headers, timeout=TIMEOUT)
        assert create_resp.status_code in (200, 201), f"Post creation failed: {create_resp.status_code} {create_resp.text}"
        create_json = create_resp.json()
        # Attempt common id locations
        if isinstance(create_json, dict) and "id" in create_json:
            created_post_id = create_json["id"]
        elif isinstance(create_json, dict) and "data" in create_json and isinstance(create_json["data"], dict) and "id" in create_json["data"]:
            created_post_id = create_json["data"]["id"]
        else:
            # try to find first uuid-like value
            def find_id(obj):
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        if k == "id" and v:
                            return v
                        res = find_id(v)
                        if res:
                            return res
                elif isinstance(obj, list):
                    for item in obj:
                        res = find_id(item)
                        if res:
                            return res
                return None
            created_post_id = find_id(create_json)

        assert created_post_id, f"Created post id not found in response: {create_json}"

        # 3) Update the post to create a new version - PUT /api/v1/admin/posts/:id
        update_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}"
        update_payload = {
            "title": "Test Post for Versions - Updated",
            "summary": "Updated summary to trigger version",
            "body": "Updated body content to create a new version"
        }
        update_resp = session.put(update_url, json=update_payload, headers=auth_headers, timeout=TIMEOUT)
        assert update_resp.status_code in (200, 204), f"Post update failed: {update_resp.status_code} {update_resp.text}"

        # allow eventual consistency / version creation latency
        time.sleep(0.5)

        # 4) GET versions - GET /api/v1/admin/posts/:id/versions
        versions_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}/versions"
        versions_resp = session.get(versions_url, headers=auth_headers, timeout=TIMEOUT)
        assert versions_resp.status_code == 200, f"GET versions failed: {versions_resp.status_code} {versions_resp.text}"

        versions_json = versions_resp.json()

        # Flexible parsing to find list of versions and pagination metadata
        versions_list = None
        pagination_meta = None

        if isinstance(versions_json, dict):
            # common keys
            for key in ("items", "data", "versions", "results"):
                if key in versions_json and isinstance(versions_json[key], list):
                    versions_list = versions_json[key]
                    break
            # direct list as root?
            if versions_list is None:
                # Some APIs return {"meta":..., "data": [...]}
                for key in ("meta", "pagination", "paginationMeta"):
                    if key in versions_json and isinstance(versions_json[key], dict):
                        pagination_meta = versions_json[key]
                # Try data as nested
                if "data" in versions_json and isinstance(versions_json["data"], list):
                    versions_list = versions_json["data"]
            # fallback: if root dict contains numeric-indexed items
            if versions_list is None:
                possible_list = [v for v in versions_json.values() if isinstance(v, list)]
                if possible_list:
                    versions_list = possible_list[0]
            # pagination fields search
            if pagination_meta is None:
                for key in ("meta", "pagination", "page", "paginationMeta", "pageInfo"):
                    if key in versions_json:
                        pagination_meta = versions_json[key]
        elif isinstance(versions_json, list):
            versions_list = versions_json

        assert isinstance(versions_list, list), f"Versions list not found or not a list in response: {versions_json}"
        assert len(versions_list) >= 1, f"Expected at least one version summary, got 0. Response: {versions_json}"

        # Validate each version summary has minimal expected fields
        def _has_timestamp(v):
            return any(k in v for k in ("createdAt", "created_at", "created", "timestamp"))
        def _has_id_or_version(v):
            return any(k in v for k in ("id", "version", "versionId"))

        for idx, ver in enumerate(versions_list):
            assert isinstance(ver, dict), f"Version entry at index {idx} is not an object: {ver}"
            assert _has_id_or_version(ver), f"Version entry missing id/version fields: {ver}"
            assert _has_timestamp(ver), f"Version entry missing created timestamp: {ver}"

        # Validate pagination metadata presence (be permissive)
        if pagination_meta is None:
            # try to detect top-level numeric metadata
            possible_meta_keys = {"total", "perPage", "page", "pageSize", "limit", "offset"}
            found_meta = any(k in versions_json for k in possible_meta_keys) if isinstance(versions_json, dict) else False
            assert found_meta or pagination_meta is not None, f"Pagination metadata not found in response: {versions_json}"
        else:
            assert isinstance(pagination_meta, dict), f"Pagination metadata present but not an object: {pagination_meta}"
            # At least one of total/page/perPage keys
            assert any(k in pagination_meta for k in ("total", "count", "page", "perPage", "limit")), \
                f"Pagination metadata missing expected keys: {pagination_meta}"

        print("TC011 passed: GET /api/v1/admin/posts/:id/versions returned valid version summaries and pagination metadata.")

    finally:
        # Cleanup: attempt to delete the created post
        if created_post_id:
            try:
                # Try HTTP DELETE first
                del_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}"
                del_resp = session.delete(del_url, headers=auth_headers if access_token else headers, timeout=TIMEOUT)
                if del_resp.status_code not in (200, 202, 204):
                    # Try alternate delete confirmation endpoint
                    del_confirm_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}/delete"
                    try:
                        confirm_payload = {"confirmed": True}
                        conf_resp = session.post(del_confirm_url, json=confirm_payload, headers=auth_headers if access_token else headers, timeout=TIMEOUT)
                        if conf_resp.status_code not in (200, 202, 204):
                            # Last resort: try to trash the post
                            trash_url = f"{BASE_URL}/api/v1/admin/posts/{created_post_id}/trash"
                            session.post(trash_url, headers=auth_headers if access_token else headers, timeout=TIMEOUT)
                    except Exception:
                        pass
            except Exception:
                pass


if __name__ == "__main__":
    try:
        test_get_admin_post_versions_valid()
    except AssertionError as e:
        print("Test failed:", e)
        sys.exit(1)
    except Exception as ex:
        print("Unexpected error during test:", ex)
        sys.exit(2)
    sys.exit(0)