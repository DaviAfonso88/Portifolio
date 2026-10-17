import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_api_v1_public_projects_slug_notfound():
    """
    TC001: Verify that GET /api/v1/public/projects/:slug returns 404 with a handled not-found response
    when the project slug does not exist.
    """
    slug = "this-slug-does-not-exist-unique-0001"
    url = f"{BASE_URL}/api/v1/public/projects/{slug}"
    headers = {
        "Accept": "application/json",
        "User-Agent": "tc001-test-client/1.0",
        # Instruction: Validate routes in production serverMode
        "X-Server-Mode": "production",
    }

    try:
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")

    # Expect a 404 Not Found status
    assert resp.status_code == 404, f"Expected 404 Not Found, got {resp.status_code}. Response text: {resp.text}"

    # Expect a handled not-found response, preferably JSON with a message/error/detail
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" in content_type.lower():
        try:
            body = resp.json()
        except ValueError:
            raise AssertionError("Response Content-Type is JSON but body could not be parsed as JSON")

        assert isinstance(body, dict), f"Expected JSON object body, got {type(body)}"

        # Ensure there is some form of handled error information
        allowed_keys = ("message", "error", "detail", "status", "code")
        if not any(k in body for k in allowed_keys):
            raise AssertionError(f"JSON error response did not contain any of expected keys {allowed_keys}. Body: {body}")

        # If message-like key present, ensure it's not empty
        for k in ("message", "error", "detail"):
            if k in body:
                val = body.get(k)
                assert isinstance(val, str) and val.strip(), f"Expected non-empty string in '{k}', got: {val}"
                break
    else:
        # If not JSON, still acceptable if service returns a handled HTML not-found page,
        # but we consider a handled response should at least include a not-found indicator.
        text_lower = resp.text.lower()
        assert "not found" in text_lower or "404" in text_lower, "Non-JSON 404 response did not contain expected not-found indicators"


if __name__ == "__main__":
    try:
        test_get_api_v1_public_projects_slug_notfound()
    except AssertionError as e:
        print(f"TEST FAILED: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"UNEXPECTED ERROR: {e}", file=sys.stderr)
        sys.exit(2)
    else:
        print("TEST PASSED")
        sys.exit(0)