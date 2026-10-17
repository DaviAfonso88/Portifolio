import requests
import uuid
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_public_project_slug_not_found():
    slug = f"nonexistent-slug-{uuid.uuid4().hex}"
    url = f"{BASE_URL}/api/v1/public/projects/{slug}"
    headers = {"Accept": "application/json"}

    try:
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise AssertionError(f"HTTP request failed: {exc}")

    # Expect 404 Not Found
    if resp.status_code != 404:
        raise AssertionError(f"Expected status 404, got {resp.status_code}. Response body: {resp.text}")

    content_type = resp.headers.get("Content-Type", "")
    # If JSON is returned, validate JSON shape contains a handled not-found indication.
    try:
        body = resp.json()
    except ValueError:
        # Not JSON: ensure the plaintext contains an indicative not-found message
        text = (resp.text or "").lower()
        if "not found" not in text and "not-found" not in text:
            raise AssertionError("Response is not JSON and does not contain a not-found message.")
        # Success: plaintext contains not-found
        print("PASS: Received 404 with non-JSON body containing not-found message.")
        return

    # Body should be a dict or at least contain text indicating not-found
    if not isinstance(body, (dict, list)):
        raise AssertionError("Response JSON is not an object/array as expected for an error payload.")

    # Search JSON for not-found indicators or common error keys
    found_indicator = False

    # If dict, check common keys
    if isinstance(body, dict):
        for key in ("message", "error", "detail", "status", "errors"):
            if key in body:
                val = body[key]
                if isinstance(val, str) and ("not found" in val.lower() or "not-found" in val.lower()):
                    found_indicator = True
                    break
                # If errors is list or dict, fall through to deep search

    # Deep search for 'not found' text in any string leaf
    def deep_search(obj):
        nonlocal found_indicator
        if found_indicator:
            return
        if isinstance(obj, str):
            if "not found" in obj.lower() or "not-found" in obj.lower():
                found_indicator = True
        elif isinstance(obj, dict):
            for v in obj.values():
                deep_search(v)
                if found_indicator:
                    return
        elif isinstance(obj, list):
            for item in obj:
                deep_search(item)
                if found_indicator:
                    return

    deep_search(body)

    if not found_indicator:
        raise AssertionError("JSON response does not appear to be a handled not-found response (no 'not found' text or error/message keys found).")

    # Optionally assert Content-Type is JSON-ish
    if "json" not in content_type.lower():
        print("WARN: Response content-type is not JSON, but body parsed as JSON. Content-Type: " + content_type)

    print("PASS: GET /api/v1/public/projects/:slug returned 404 with handled not-found response.")


if __name__ == "__main__":
    try:
        test_get_public_project_slug_not_found()
    except AssertionError as e:
        print("FAIL:", e)
        sys.exit(1)
    except Exception as e:
        print("ERROR:", e)
        sys.exit(2)
    sys.exit(0)