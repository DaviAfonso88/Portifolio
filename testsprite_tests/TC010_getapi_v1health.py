import requests
import sys

BASE_ENDPOINT = "http://localhost:3000"

def test_get_api_v1_health():
    url = f"{BASE_ENDPOINT}/api/v1/health"
    headers = {"Accept": "application/json"}
    try:
        resp = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request to {url} failed: {e}")

    # Validate HTTP status
    assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}. Body: {resp.text}"

    # Validate JSON content-type and parse
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" not in content_type.lower():
        # allow JSON-looking body as a fallback
        if not resp.text.strip().startswith("{"):
            raise AssertionError(f"Expected JSON response (Content-Type application/json). Got: '{content_type}' and body does not look like JSON.")
    try:
        data = resp.json()
    except ValueError:
        raise AssertionError("Response body is not valid JSON")

    # Ensure the response is a JSON object
    assert isinstance(data, dict), f"Expected JSON object, got {type(data).__name__}: {data}"

    # Validate health indicator: accept several common shapes
    healthy = False
    if "healthy" in data:
        hv = data["healthy"]
        if isinstance(hv, bool):
            healthy = hv
        else:
            healthy = str(hv).lower() in ("true", "healthy", "ok", "up")
    if not healthy and "status" in data:
        healthy = str(data["status"]).lower() in ("healthy", "ok", "up")
    if not healthy and data.get("statusCode") == 200:
        healthy = True

    assert healthy, f"Health indicator not healthy in response JSON: {data}"

    # Validate presence of service metadata (accept several possible keys)
    metadata_keys = ("service", "meta", "project", "name", "version", "uptime", "timestamp")
    has_meta = any(k in data for k in metadata_keys)
    # also check nested service/meta objects
    if not has_meta:
        for k in ("service", "meta"):
            val = data.get(k)
            if isinstance(val, dict) and any(x in val for x in ("name", "version", "uptime", "commit")):
                has_meta = True
                break

    assert has_meta, f"Service metadata not found in response JSON; expected one of {metadata_keys}. Full response: {data}"

    print("TC010 passed: GET /api/v1/health returned 200 with healthy status and service metadata.")

if __name__ == "__main__":
    try:
        test_get_api_v1_health()
    except AssertionError as e:
        print(f"TC010 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC010 encountered an unexpected error: {e}")
        sys.exit(2)
    sys.exit(0)