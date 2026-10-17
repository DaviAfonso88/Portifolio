import requests
import sys

BASE_ENDPOINT = "http://localhost:3000"
TIMEOUT = 30


def test_get_api_v1_health_check():
    url = f"{BASE_ENDPOINT}/api/v1/health"
    headers = {
        "Accept": "application/json",
        "User-Agent": "davidev-healthcheck-test/1.0",
        "X-Server-Mode": "production",  # per instructions: validate in production serverMode
    }

    try:
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise AssertionError(f"HTTP request to {url} failed: {exc}") from exc

    assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}. Body: {resp.text}"

    try:
        body = resp.json()
    except ValueError:
        raise AssertionError(f"Response is not valid JSON. Raw body: {resp.text}")

    assert isinstance(body, dict), f"Expected JSON object in response, got {type(body).__name__}"

    # Validate healthy status: accept several common shapes
    status_ok = False
    if "healthy" in body:
        # healthy can be boolean or string
        val = body["healthy"]
        if isinstance(val, bool):
            status_ok = val is True
        else:
            status_ok = str(val).lower() in {"true", "1", "ok", "healthy", "up", "pass", "running"}
    elif "status" in body:
        status_ok = str(body["status"]).lower() in {"ok", "healthy", "up", "pass", "running"}
    elif isinstance(body.get("metadata"), dict) and "status" in body["metadata"]:
        status_ok = str(body["metadata"]["status"]).lower() in {"ok", "healthy", "up", "pass", "running"}

    assert status_ok, f"Health status not healthy/ok. Response body: {body}"

    # Validate presence of service metadata: expect at least one of common keys
    metadata_keys = {"service", "name", "version", "uptime", "metadata", "app", "commit", "build"}
    has_metadata = any(k in body for k in metadata_keys)

    # also accept metadata nested under 'metadata'
    if not has_metadata and isinstance(body.get("metadata"), dict):
        has_metadata = bool(body["metadata"])

    assert has_metadata, f"Expected service metadata (e.g., name, version, uptime) in response. Body: {body}"

    print("test_get_api_v1_health_check: PASSED")
    return True


if __name__ == "__main__":
    try:
        test_get_api_v1_health_check()
    except AssertionError as e:
        print(f"test_get_api_v1_health_check: FAILED - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"test_get_api_v1_health_check: ERROR - {e}")
        sys.exit(2)
    sys.exit(0)