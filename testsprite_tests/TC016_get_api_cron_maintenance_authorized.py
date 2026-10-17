import os
import re
import sys
from datetime import datetime, timezone
import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def _find_iso8601_in_value(value):
    if not isinstance(value, str):
        return None
    # Simple ISO8601 regex (YYYY-MM-DDTHH:MM:SS[.fraction][Z or ±HH:MM])
    iso_regex = re.compile(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$"
    )
    m = iso_regex.search(value)
    return m.group(0) if m else None


def _parse_iso8601(s):
    # Handle trailing Z by replacing with +00:00 for fromisoformat
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s)


def test_get_api_cron_maintenance_authorized():
    cron_secret = os.getenv("CRON_SECRET")
    if not cron_secret:
        print("SKIPPED: CRON_SECRET env var not set; skipping authorized cron maintenance test.")
        return

    url = f"{BASE_URL}/api/cron/maintenance"
    headers = {
        "Authorization": f"Bearer {cron_secret}",
        "Accept": "application/json",
    }

    try:
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request to {url} failed: {e}") from e

    # Expect authorized success
    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}: {resp.text}"

    # Parse JSON body
    try:
        content = resp.json()
    except ValueError:
        raise AssertionError(f"Response is not valid JSON: {resp.text}")

    assert isinstance(content, (dict, list)), "Response JSON should be an object or array"

    # Determine success indicator: look for obvious keys or messages
    success_indicator = False
    if isinstance(content, dict):
        # Check boolean flags
        for k in content:
            lk = k.lower()
            if lk in ("ok", "success", "succeeded", "executed") and content[k] is True:
                success_indicator = True
                break
            if lk in ("purged", "purge_count", "purge", "purged_count") and isinstance(content[k], (int, float)):
                # even 0 is acceptable as a successful run
                success_indicator = True
                break
        # Check message text
        if not success_indicator:
            msg = content.get("message") or content.get("result") or content.get("status")
            if isinstance(msg, str) and any(word in msg.lower() for word in ("purge", "purged", "success", "executed")):
                success_indicator = True
    else:
        # If it's a list, convert to string and search for success words
        txt = str(content)
        if any(word in txt.lower() for word in ("purge", "purged", "success", "executed")):
            success_indicator = True

    assert success_indicator, f"Response did not indicate successful purge execution: {content}"

    # Find audit timestamp anywhere in JSON values
    audit_timestamp_str = None

    def search_for_timestamp(obj):
        nonlocal audit_timestamp_str
        if audit_timestamp_str:
            return
        if isinstance(obj, str):
            ts = _find_iso8601_in_value(obj)
            if ts:
                audit_timestamp_str = ts
                return
        elif isinstance(obj, dict):
            for v in obj.values():
                search_for_timestamp(v)
                if audit_timestamp_str:
                    return
        elif isinstance(obj, list):
            for item in obj:
                search_for_timestamp(item)
                if audit_timestamp_str:
                    return
        else:
            # other primitive types - ignore
            return

    search_for_timestamp(content)

    assert audit_timestamp_str, f"No audit timestamp (ISO8601) found in response: {content}"

    # Validate timestamp parseability and it's not in the far future (simple sanity)
    try:
        ts_dt = _parse_iso8601(audit_timestamp_str)
    except Exception as e:
        raise AssertionError(f"Found audit timestamp but could not parse it: {audit_timestamp_str}") from e

    now = datetime.now(timezone.utc)
    # allow timestamps up to 5 minutes in the future to account for clock skew
    assert ts_dt.tzinfo is not None, "Audit timestamp must include timezone information"
    delta = ts_dt - now
    assert delta.total_seconds() < 300, f"Audit timestamp is unreasonably far in the future: {audit_timestamp_str}"

    print("TC016 passed: /api/cron/maintenance authorized returned 200, purge indicated, audit timestamp found.")


if __name__ == "__main__":
    try:
        test_get_api_cron_maintenance_authorized()
    except AssertionError as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
    except Exception as exc:
        print(f"UNEXPECTED ERROR: {exc}")
        sys.exit(2)
    else:
        print("TEST SUCCEEDED")
        sys.exit(0)