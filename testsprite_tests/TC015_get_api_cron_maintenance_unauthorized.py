import requests
import sys
import traceback

BASE_ENDPOINT = "http://localhost:3000"
TIMEOUT = 30  # seconds

def test_get_api_cron_maintenance_unauthorized():
    """
    TC015: Verify that GET /api/cron/maintenance without valid CRON_SECRET
    authorization header returns 401 Unauthorized.
    This test checks both:
      - no Authorization header
      - an invalid Authorization header
    """
    url = f"{BASE_ENDPOINT.rstrip('/')}/api/cron/maintenance"

    try:
        # Case 1: No Authorization header
        resp_no_auth = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request (no auth) failed: {e}") from e

    # Assert unauthorized for missing header
    assert resp_no_auth.status_code == 401, (
        f"Expected 401 Unauthorized for missing Authorization header, "
        f"got {resp_no_auth.status_code}. Response body: {resp_no_auth.text}"
    )

    try:
        # Case 2: Invalid Authorization header
        headers = {"Authorization": "Bearer invalid_cron_secret"}
        resp_invalid = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request (invalid auth) failed: {e}") from e

    # Assert unauthorized for invalid header
    assert resp_invalid.status_code == 401, (
        f"Expected 401 Unauthorized for invalid CRON_SECRET, "
        f"got {resp_invalid.status_code}. Response body: {resp_invalid.text}"
    )

if __name__ == "__main__":
    try:
        test_get_api_cron_maintenance_unauthorized()
        print("TC015 passed: /api/cron/maintenance correctly returns 401 when unauthorized.")
        sys.exit(0)
    except AssertionError:
        traceback.print_exc()
        print("TC015 failed.")
        sys.exit(1)
    except Exception:
        traceback.print_exc()
        print("TC015 encountered an unexpected error.")
        sys.exit(2)