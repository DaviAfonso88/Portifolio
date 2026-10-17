import requests
import sys

BASE = "http://localhost:3000"
TIMEOUT = 30

def check_security_headers(resp):
    headers = resp.headers
    # X-Frame-Options: DENY
    xfo = headers.get("X-Frame-Options")
    assert xfo is not None, "Missing X-Frame-Options header"
    assert "DENY" in xfo.upper(), f"X-Frame-Options expected to contain DENY, got: {xfo}"

    # X-Content-Type-Options: nosniff
    xcto = headers.get("X-Content-Type-Options")
    assert xcto is not None, "Missing X-Content-Type-Options header"
    assert "nosniff" in xcto.lower(), f"X-Content-Type-Options expected to contain nosniff, got: {xcto}"

    # Strict-Transport-Security
    sts = headers.get("Strict-Transport-Security")
    assert sts is not None, "Missing Strict-Transport-Security header"
    assert "max-age" in sts.lower(), f"Strict-Transport-Security expected to contain max-age, got: {sts}"

    # Content-Security-Policy: strict - existence and sanity checks
    csp = headers.get("Content-Security-Policy")
    assert csp is not None and csp.strip() != "", "Missing Content-Security-Policy header"
    lc = csp.lower()
    # Ensure CSP declares default-src or script-src and does not allow unsafe-inline/eval
    assert ("default-src" in lc) or ("script-src" in lc), f"CSP should contain default-src or script-src, got: {csp}"
    assert "unsafe-inline" not in lc, "CSP contains unsafe-inline which is not allowed for a strict policy"
    assert "unsafe-eval" not in lc, "CSP contains unsafe-eval which is not allowed for a strict policy"

def assert_no_secrets(text, context):
    lower = text.lower()
    secret_patterns = [
        "aws_secret", "aws_secret_access_key", "awssecret", "secret_key", "secret=", "password=", "passwd=",
        "api_key", "apikey", "private_key", "begin rsa private key", "begin private key", "jwt_secret",
        "mongo_uri", "mongodb://", "postgresql://", "password:", "token:", "bearer ", "access_key_id",
        "secretaccesskey", "client_secret"
    ]
    for p in secret_patterns:
        if p in lower:
            raise AssertionError(f"Potential secret pattern '{p}' found in {context}")

def test_tc018_get_como_foi_construido():
    session = requests.Session()
    endpoints = [
        "/pt-BR/como-foi-construido",
        "/en/como-foi-construido"
    ]

    # Validate the bilingual case study pages
    for path in endpoints:
        url = BASE.rstrip("/") + path
        try:
            resp = session.get(url, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to {url} failed: {e}")

        assert resp.status_code == 200, f"Expected 200 OK for {url}, got {resp.status_code}"
        content_type = resp.headers.get("Content-Type", "")
        assert "html" in content_type.lower(), f"Expected HTML content for {url}, got Content-Type: {content_type}"

        text = resp.text
        # Check for editorial content keywords that indicate authentic case study material
        keywords = [
            "adr", "architecture decision record", "adrs", "metrics", "mvp", "case study",
            "como foi construído", "how it was built", "decisions", "technical decisions",
            "outcome", "metrics", "performance", "lessons learned", "observability"
        ]
        matched = [k for k in keywords if k.lower() in text.lower()]
        assert len(matched) >= 2, f"Expected at least 2 editorial keywords on {url}, found: {matched}"

        # Ensure no obvious secrets are exposed in the HTML
        assert_no_secrets(text, f"page {url}")

        # Security headers check
        try:
            check_security_headers(resp)
        except AssertionError as e:
            raise AssertionError(f"Security header check failed for {url}: {e}")

    # Validate API docs interactive page
    docs_url = BASE.rstrip("/") + "/api/docs"
    try:
        resp_docs = session.get(docs_url, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request to {docs_url} failed: {e}")

    assert resp_docs.status_code == 200, f"Expected 200 OK for {docs_url}, got {resp_docs.status_code}"
    ct_docs = resp_docs.headers.get("Content-Type", "")
    assert "html" in ct_docs.lower(), f"Expected HTML for API docs, got Content-Type: {ct_docs}"
    docs_text = resp_docs.text.lower()
    assert ("swagger" in docs_text) or ("swagger-ui" in docs_text) or ("redoc" in docs_text) or ("openapi" in docs_text), \
        f"API docs page at {docs_url} does not contain Swagger UI/OpenAPI markers"

    # Security headers for docs
    try:
        check_security_headers(resp_docs)
    except AssertionError as e:
        raise AssertionError(f"Security header check failed for {docs_url}: {e}")

    # Validate OpenAPI schema
    openapi_url = BASE.rstrip("/") + "/api/openapi.json"
    try:
        resp_openapi = session.get(openapi_url, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request to {openapi_url} failed: {e}")

    assert resp_openapi.status_code == 200, f"Expected 200 OK for {openapi_url}, got {resp_openapi.status_code}"
    ct_openapi = resp_openapi.headers.get("Content-Type", "")
    assert "json" in ct_openapi.lower(), f"Expected JSON Content-Type for OpenAPI, got: {ct_openapi}"

    try:
        schema = resp_openapi.json()
    except ValueError:
        raise AssertionError(f"OpenAPI response at {openapi_url} is not valid JSON")

    assert isinstance(schema, dict), "OpenAPI schema should be a JSON object"
    openapi_version = schema.get("openapi") or schema.get("swagger")
    assert openapi_version is not None, "OpenAPI schema missing 'openapi' or 'swagger' field"
    # If OpenAPI 3.x, openapi should start with "3."
    if isinstance(openapi_version, str):
        assert openapi_version.startswith("3") or openapi_version.startswith("2"), \
            f"Unexpected OpenAPI/Swagger version: {openapi_version}"
    assert "paths" in schema and isinstance(schema["paths"], dict), "OpenAPI schema missing 'paths' object"

    # Ensure OpenAPI JSON does not contain exposed secrets
    assert_no_secrets(resp_openapi.text, "OpenAPI schema")

    # Security headers for OpenAPI JSON
    try:
        check_security_headers(resp_openapi)
    except AssertionError as e:
        raise AssertionError(f"Security header check failed for {openapi_url}: {e}")

    print("TC018 passed: bilingual case study pages, API docs, OpenAPI schema, and security headers validated.")

if __name__ == "__main__":
    try:
        test_tc018_get_como_foi_construido()
    except AssertionError as e:
        print(f"TC018 failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"TC018 encountered an unexpected error: {e}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)