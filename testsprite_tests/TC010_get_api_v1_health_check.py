import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_api_v1_health_check():
    try:
        # 1) Check /api/v1/health
        health_url = f"{BASE_URL}/api/v1/health"
        r = requests.get(health_url, timeout=TIMEOUT)
        assert r.status_code == 200, f"/api/v1/health returned {r.status_code}"
        ct = r.headers.get("Content-Type", "")
        assert "application/json" in ct.lower(), f"/api/v1/health content-type not json: {ct}"

        try:
            body = r.json()
        except Exception as e:
            raise AssertionError(f"/api/v1/health returned non-json payload: {e}")

        # status check - be flexible about accepted healthy values
        assert "status" in body, f"/api/v1/health body missing 'status': {body}"
        status_val = str(body.get("status", "")).lower()
        assert any(k in status_val for k in ("healthy", "ok", "up")), f"unexpected health status value: {body.get('status')}"

        # service metadata - accept either top-level metadata keys or nested 'metadata'
        metadata_keys = {"service", "serviceName", "name", "version", "uptime", "build", "environment"}
        has_metadata = bool(metadata_keys.intersection(body.keys()))
        if not has_metadata:
            # check nested metadata
            meta = body.get("metadata") if isinstance(body.get("metadata"), dict) else {}
            has_metadata = bool(meta)
        assert has_metadata, f"/api/v1/health does not expose service metadata: {body}"

        # Security headers on health response
        hdr = r.headers
        xframe = hdr.get("X-Frame-Options")
        xcontent = hdr.get("X-Content-Type-Options")
        hsts = hdr.get("Strict-Transport-Security")
        csp = hdr.get("Content-Security-Policy") or hdr.get("Content-Security-Policy-Report-Only")

        assert xframe is not None, "Missing X-Frame-Options header on /api/v1/health"
        assert xframe.strip().lower() == "deny", f"Unexpected X-Frame-Options value: {xframe}"
        assert xcontent is not None, "Missing X-Content-Type-Options header on /api/v1/health"
        assert xcontent.strip().lower() == "nosniff", f"Unexpected X-Content-Type-Options value: {xcontent}"
        assert hsts is not None, "Missing Strict-Transport-Security header on /api/v1/health"
        assert "max-age" in hsts.lower(), f"Unexpected Strict-Transport-Security value: {hsts}"
        assert csp is not None, "Missing Content-Security-Policy header on /api/v1/health"

        # 2) Check /api/docs (interactive docs - Swagger UI)
        docs_url = f"{BASE_URL}/api/docs"
        r_docs = requests.get(docs_url, timeout=TIMEOUT)
        assert r_docs.status_code == 200, f"/api/docs returned {r_docs.status_code}"
        docs_ct = r_docs.headers.get("Content-Type", "")
        assert "text/html" in docs_ct.lower() or "application/xhtml+xml" in docs_ct.lower(), f"/api/docs not HTML: {docs_ct}"
        docs_text = r_docs.text.lower()
        assert ("swagger" in docs_text) or ("swagger-ui" in docs_text) or ("openapi" in docs_text), "/api/docs does not appear to contain Swagger/OpenAPI UI content"

        # Also validate security headers present on docs response
        hdr_docs = r_docs.headers
        assert hdr_docs.get("X-Frame-Options") is not None, "Missing X-Frame-Options on /api/docs"
        assert hdr_docs.get("X-Content-Type-Options") is not None, "Missing X-Content-Type-Options on /api/docs"
        assert hdr_docs.get("Strict-Transport-Security") is not None, "Missing Strict-Transport-Security on /api/docs"
        assert (hdr_docs.get("Content-Security-Policy") or hdr_docs.get("Content-Security-Policy-Report-Only")) is not None, "Missing CSP on /api/docs"

        # 3) Check /api/openapi.json (OpenAPI schema)
        openapi_url = f"{BASE_URL}/api/openapi.json"
        r_open = requests.get(openapi_url, timeout=TIMEOUT)
        assert r_open.status_code == 200, f"/api/openapi.json returned {r_open.status_code}"
        open_ct = r_open.headers.get("Content-Type", "")
        assert "application/json" in open_ct.lower(), f"/api/openapi.json content-type not json: {open_ct}"
        try:
            open_body = r_open.json()
        except Exception as e:
            raise AssertionError(f"/api/openapi.json returned non-json payload: {e}")
        assert "openapi" in open_body, "OpenAPI schema missing 'openapi' field"
        openapi_version = str(open_body.get("openapi", ""))
        assert openapi_version.startswith("3"), f"Unexpected OpenAPI version: {openapi_version}"
        assert isinstance(open_body.get("paths", None), dict), "OpenAPI schema missing 'paths' object"

        # 4) Validate Phase 9 case study pages (pt-BR and en)
        case_urls = [
            f"{BASE_URL}/pt-BR/como-foi-construido",
            f"{BASE_URL}/en/como-foi-construido"
        ]
        secret_indicators = [
            "private_key", "secret", "aws_secret_access_key", "-----begin private key-----", "api_key=", "token="
        ]
        for url in case_urls:
            rr = requests.get(url, timeout=TIMEOUT)
            assert rr.status_code == 200, f"{url} returned {rr.status_code}"
            ctype = rr.headers.get("Content-Type", "")
            assert "text/html" in ctype.lower() or "application/xhtml+xml" in ctype.lower(), f"{url} not HTML: {ctype}"
            body_text = rr.text.lower()
            # Ensure editorial content presence - look for likely keywords
            assert any(k in body_text for k in ("como foi", "como foi constru", "case study", "architecture", "adr", "arquitet")), f"{url} does not contain expected editorial/case-study content"
            # Ensure no obvious secrets are leaked
            assert not any(si in body_text for si in secret_indicators), f"{url} appears to contain secret indicators"

            # security headers on page responses as well
            hdr_page = rr.headers
            assert hdr_page.get("X-Frame-Options") is not None, f"Missing X-Frame-Options on {url}"
            assert hdr_page.get("X-Content-Type-Options") is not None, f"Missing X-Content-Type-Options on {url}"
            assert hdr_page.get("Strict-Transport-Security") is not None, f"Missing Strict-Transport-Security on {url}"
            assert (hdr_page.get("Content-Security-Policy") or hdr_page.get("Content-Security-Policy-Report-Only")) is not None, f"Missing CSP on {url}"

        print("TC010: PASS - Health, docs, openapi, case study pages, and security headers validated successfully.")
    except AssertionError as ae:
        print(f"TC010: FAIL - Assertion error: {ae}")
        raise
    except requests.RequestException as re:
        print(f"TC010: FAIL - Request error: {re}")
        raise
    except Exception as e:
        print(f"TC010: FAIL - Unexpected error: {e}")
        raise


if __name__ == "__main__":
    try:
        test_get_api_v1_health_check()
    except Exception:
        sys.exit(1)
    sys.exit(0)