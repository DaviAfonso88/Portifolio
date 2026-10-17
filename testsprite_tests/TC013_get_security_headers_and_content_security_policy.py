import requests
import sys

BASE_ENDPOINT = "http://localhost:3000"
TIMEOUT = 30

def test_security_headers_and_csp():
    session = requests.Session()
    endpoints = [
        "/pt-BR/como-foi-construido",
        "/en/como-foi-construido",
        "/api/docs",
        "/api/openapi.json",
    ]

    failures = []

    for path in endpoints:
        url = BASE_ENDPOINT.rstrip("/") + path
        headers = {"Accept": "text/html"}
        if path.endswith(".json") or path.startswith("/api/openapi.json"):
            headers = {"Accept": "application/json, */*"}

        try:
            resp = session.get(url, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as exc:
            failures.append(f"Request to {url} failed: {exc}")
            continue

        # Basic status check
        try:
            assert resp.status_code == 200, f"{url} returned status {resp.status_code}"
        except AssertionError as e:
            failures.append(str(e))
            # continue to collect header failures as well

        # Headers validations
        try:
            # X-Frame-Options == DENY (case-insensitive)
            xfo = resp.headers.get("X-Frame-Options")
            assert xfo is not None, f"Missing X-Frame-Options on {url}"
            assert xfo.strip().lower() == "deny", f"X-Frame-Options on {url} is not DENY (got: {xfo})"

            # X-Content-Type-Options == nosniff
            xcto = resp.headers.get("X-Content-Type-Options")
            assert xcto is not None, f"Missing X-Content-Type-Options on {url}"
            assert xcto.strip().lower() == "nosniff", f"X-Content-Type-Options on {url} is not nosniff (got: {xcto})"

            # Strict-Transport-Security present and non-empty
            sts = resp.headers.get("Strict-Transport-Security")
            assert sts is not None and sts.strip() != "", f"Missing or empty Strict-Transport-Security on {url}"

            # Content-Security-Policy present and strict (no unsafe-inline / unsafe-eval)
            csp = resp.headers.get("Content-Security-Policy")
            assert csp is not None and csp.strip() != "", f"Missing Content-Security-Policy on {url}"
            csp_l = csp.lower()

            # Must include at least one typical directive and must not include unsafe tokens
            has_directive = any(k in csp_l for k in ("default-src", "script-src", "base-uri", "object-src"))
            assert has_directive, f"Content-Security-Policy on {url} does not include a recognized source directive (got: {csp})"

            assert "unsafe-inline" not in csp_l, f"Content-Security-Policy on {url} contains unsafe-inline (got: {csp})"
            assert "unsafe-eval" not in csp_l, f"Content-Security-Policy on {url} contains unsafe-eval (got: {csp})"

        except AssertionError as e:
            failures.append(str(e))

    session.close()

    if failures:
        joined = "\n".join(failures)
        raise AssertionError(f"Security header/CSP validation failed:\n{joined}")

if __name__ == "__main__":
    try:
        test_security_headers_and_csp()
        print("TC013 passed: security headers and CSP validated successfully.")
    except AssertionError as e:
        print("TC013 failed:")
        print(e)
        sys.exit(1)