#!/usr/bin/env python3
import os
import sys
import uuid
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def get_tokens(session, email, password):
    url = f"{BASE_URL}/api/v1/auth/login"
    payload = {"email": email, "password": password}
    try:
        r = session.post(url, json=payload, timeout=TIMEOUT)
    except RequestException as e:
        raise RuntimeError(f"Login request failed: {e}")
    if r.status_code != 200:
        raise RuntimeError(f"Login failed: status={r.status_code}, body={r.text}")
    try:
        data = r.json()
    except ValueError:
        raise RuntimeError(f"Login response not JSON: {r.text}")

    # Accept common token keys
    access = data.get("accessToken") or data.get("access_token") or data.get("access") or data.get("token")
    refresh = data.get("refreshToken") or data.get("refresh_token") or data.get("refresh")
    if not access:
        raise RuntimeError(f"Access token not found in login response: {data}")
    return access, refresh


def create_post(session, token, post_payload):
    url = f"{BASE_URL}/api/v1/admin/posts"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        r = session.post(url, json=post_payload, headers=headers, timeout=TIMEOUT)
    except RequestException as e:
        raise RuntimeError(f"Create post request failed: {e}")
    return r


def attempt_delete_post(session, token, post_id):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    # Try multiple deletion endpoints/strategies to be resilient
    endpoints = [
        (f"{BASE_URL}/api/v1/admin/posts/{post_id}/delete", "post", {"confirmed": True}),
        (f"{BASE_URL}/api/v1/admin/posts/{post_id}/delete", "post", {}),
        (f"{BASE_URL}/api/v1/admin/posts/{post_id}/trash", "post", {}),
        (f"{BASE_URL}/api/v1/admin/posts/{post_id}", "delete", {}),
    ]
    for url, method, payload in endpoints:
        try:
            if method == "post":
                r = session.post(url, json=payload, headers=headers, timeout=TIMEOUT)
            else:
                r = session.delete(url, headers=headers, timeout=TIMEOUT)
        except RequestException:
            continue
        # If we got a 2xx or 204, consider deletion successful
        if 200 <= r.status_code < 300 or r.status_code == 204:
            return True
    return False


def test_create_post_duplicate_slug_tc007():
    session = requests.Session()

    # Credentials: prefer environment variables; fallback to defaults commonly used in tests
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "password")

    # Authenticate
    try:
        access_token, refresh_token = get_tokens(session, admin_email, admin_password)
    except Exception as e:
        raise AssertionError(f"Authentication step failed: {e}")

    # Prepare a unique slug for the first post
    unique_slug = f"test-duplicate-slug-{uuid.uuid4().hex[:8]}"
    title = "TC007 Duplicate Slug Test"
    post_payload = {
        "title": title,
        "slug": unique_slug,
        "summary": "Automated test post for duplicate slug handling",
        "body": "This is a test body for TC007.",
        "status": "draft"
    }

    created_post_id = None
    try:
        # Create the initial post - should succeed (201)
        r1 = create_post(session, access_token, post_payload)
        try:
            body1 = r1.json()
        except ValueError:
            body1 = r1.text

        assert r1.status_code in (200, 201), f"Expected create-first-post 200/201, got {r1.status_code}, body={body1}"
        # Extract id if present for cleanup
        if isinstance(body1, dict):
            created_post_id = body1.get("id") or body1.get("_id") or body1.get("postId")
        # If id not in body, try Location header
        if not created_post_id:
            loc = r1.headers.get("Location")
            if loc:
                # attempt to parse trailing id
                created_post_id = loc.rstrip("/").split("/")[-1]

        # Attempt to create another post with the same slug -> should fail (409 or 400)
        duplicate_payload = {
            "title": f"{title} - duplicate",
            "slug": unique_slug,
            "summary": "Duplicate slug attempt",
            "body": "Duplicate body",
            "status": "draft"
        }
        r2 = create_post(session, access_token, duplicate_payload)
        # Accept 400 or 409 as valid failure codes indicating duplicate slug or validation error
        if r2.status_code in (400, 409):
            # Try to validate message mentions slug or duplication
            try:
                body2 = r2.json()
            except ValueError:
                body2 = r2.text or ""
            msg_text = ""
            if isinstance(body2, dict):
                # flatten common fields
                for k in ("message", "error", "errors", "detail"):
                    if k in body2:
                        msg_text = str(body2[k])
                        break
                if not msg_text:
                    msg_text = str(body2)
            else:
                msg_text = str(body2)
            low = msg_text.lower()
            assert ("slug" in low) or ("already" in low) or ("in use" in low) or ("duplicate" in low) or ("unique" in low), (
                f"Expected validation/duplicate error mentioning slug but got: {msg_text} (status {r2.status_code})"
            )
        elif r2.status_code in (200, 201):
            # If API unexpectedly allowed duplicate, fail the test
            raise AssertionError(f"Duplicate slug was allowed: status={r2.status_code}, body={r2.text}")
        else:
            # Unexpected status code: treat as failure but provide details
            raise AssertionError(f"Unexpected status code for duplicate creation: {r2.status_code}, body={r2.text}")

        print("TC007 passed: server rejects duplicate slug as expected.")
    finally:
        # Cleanup: attempt to delete created resource if we have an id
        if created_post_id:
            deleted = attempt_delete_post(session, access_token, created_post_id)
            if not deleted:
                print(f"Warning: failed to clean up post id {created_post_id}", file=sys.stderr)


if __name__ == "__main__":
    test_create_post_duplicate_slug_tc007()