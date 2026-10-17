import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def _assert_security_headers(resp):
    headers = resp.headers
    # X-Frame-Options: DENY
    xfo = headers.get("X-Frame-Options") or headers.get("x-frame-options")
    assert xfo is not None, "Missing X-Frame-Options header"
    assert xfo.strip().lower() == "deny", f"Unexpected X-Frame-Options value: {xfo!r}"

    # X-Content-Type-Options: nosniff
    xcto = headers.get("X-Content-Type-Options") or headers.get("x-content-type-options")
    assert xcto is not None, "Missing X-Content-Type-Options header"
    assert xcto.strip().lower() == "nosniff", f"Unexpected X-Content-Type-Options value: {xcto!r}"

    # Strict-Transport-Security contains max-age
    hsts = headers.get("Strict-Transport-Security") or headers.get("strict-transport-security")
    assert hsts is not None, "Missing Strict-Transport-Security header"
    assert "max-age" in hsts.lower(), f"Strict-Transport-Security header missing max-age: {hsts!r}"

    # Content-Security-Policy (strict)
    csp = headers.get("Content-Security-Policy") or headers.get("content-security-policy")
    assert csp is not None and csp.strip() != "", "Missing or empty Content-Security-Policy header"
    # basic sanity: expect at least one directive and no obvious 'unsafe' wildcard that would indicate absent policy
    assert ";" in csp or csp.lower().startswith("default-src"), f"Content-Security-Policy looks too permissive or malformed: {csp!r}"


def test_get_api_docs_interactive_documentation():
    session = requests.Session()
    try:
        # 1) Validate Phase 9 case study pages (pt-BR and en)
        case_paths = ["/pt-BR/como-foi-construido", "/en/como-foi-construido"]
        for path in case_paths:
            url = BASE_URL.rstrip("/") + path
            try:
                r = session.get(url, headers={"Accept": "text/html"}, timeout=TIMEOUT)
            except requests.RequestException as e:
                raise AssertionError(f"Request to case study page {url} failed: {e}")
            assert r.status_code == 200, f"Expected 200 for {url}, got {r.status_code}"
            body = (r.text or "").lower()
            # heuristics for content presence
            if path.startswith("/pt-BR"):
                assert ("como foi" in body) or ("construído" in body) or ("construido" in body), (
                    f"PT case study page {url} did not contain expected portuguese content markers"
                )
            else:
                assert ("case study" in body) or ("how it was built" in body) or ("how it was built" in body.lower()), (
                    f"EN case study page {url} did not contain expected english content markers"
                )
            _assert_security_headers(r)

        # 2) Validate interactive API docs page (/api/docs)
        docs_url = BASE_URL.rstrip("/") + "/api/docs"
        try:
            r = session.get(docs_url, headers={"Accept": "text/html"}, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to API docs {docs_url} failed: {e}")
        assert r.status_code == 200, f"Expected 200 for {docs_url}, got {r.status_code}"
        html = r.text or ""
        low = html.lower()
        # Expect Swagger UI or similar interactive docs
        assert ("swagger" in low) or ("swagger-ui" in low) or ("redoc" in low), f"{docs_url} does not appear to contain interactive docs UI"
        # Expect a link or reference to the openapi JSON schema
        assert "/api/openapi.json" in html or "openapi.json" in html, f"{docs_url} does not reference openapi.json"
        _assert_security_headers(r)

        # 3) Validate OpenAPI schema endpoint (/api/openapi.json)
        openapi_url = BASE_URL.rstrip("/") + "/api/openapi.json"
        try:
            r = session.get(openapi_url, headers={"Accept": "application/json"}, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to OpenAPI JSON {openapi_url} failed: {e}")
        assert r.status_code == 200, f"Expected 200 for {openapi_url}, got {r.status_code}"
        ct = r.headers.get("Content-Type", "")
        assert "application/json" in ct.lower() or "json" in ct.lower(), f"Unexpected Content-Type for {openapi_url}: {ct!r}"
        try:
            payload = r.json()
        except ValueError as e:
            raise AssertionError(f"Response from {openapi_url} is not valid JSON: {e}")
        assert isinstance(payload, dict), f"OpenAPI payload is not an object/dict: {type(payload)}"
        assert "openapi" in payload and str(payload["openapi"]).startswith("3"), "OpenAPI version is missing or not 3.x"
        assert "paths" in payload and isinstance(payload["paths"], dict), "OpenAPI payload missing 'paths' object"
        _assert_security_headers(r)

        print("TC019 passed: API docs, OpenAPI schema, case study pages, and security headers validated successfully.")
    finally:
        session.close()


if __name__ == "__main__":
    try:
        test_get_api_docs_interactive_documentation()
    except AssertionError as e:
        print(f"TC019 failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"TC019 unexpected error: {e}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)