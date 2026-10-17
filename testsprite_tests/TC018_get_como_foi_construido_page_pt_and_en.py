import requests
import re

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_como_foi_construido_page_pt_and_en_TC018():
    # 1. Test Portuguese page
    url_pt = f"{BASE_URL}/pt-BR/como-foi-construido"
    resp_pt = requests.get(url_pt, timeout=TIMEOUT)
    assert resp_pt.status_code == 200, f"Expected 200 for {url_pt}, got {resp_pt.status_code}"
    html_pt = resp_pt.text

    assert "Como este site foi construído" in html_pt
    assert "ADR-001" in html_pt
    assert "ADR-002" in html_pt
    assert "ADR-003" in html_pt
    assert "ADR-005" in html_pt
    assert "/api/docs" in html_pt

    # 2. Test English page
    url_en = f"{BASE_URL}/en/como-foi-construido"
    resp_en = requests.get(url_en, timeout=TIMEOUT)
    assert resp_en.status_code == 200, f"Expected 200 for {url_en}, got {resp_en.status_code}"
    html_en = resp_en.text

    assert "How this website was built" in html_en
    assert "The workflow" in html_en
    assert "ADR-001" in html_en
    assert "/api/docs" in html_en

    # 3. Verify zero credentials / API key leakages in public page HTML
    sensitive_patterns = [
        r"re_[a-zA-Z0-9_]{20,}",
        r"ghp_[a-zA-Z0-9]{36}",
        r"postgres://[a-zA-Z0-9]+:[a-zA-Z0-9]+@",
    ]
    for pattern in sensitive_patterns:
        assert not re.search(pattern, html_pt), f"Sensitive pattern {pattern} leaked in pt HTML"
        assert not re.search(pattern, html_en), f"Sensitive pattern {pattern} leaked in en HTML"

if __name__ == "__main__":
    test_get_como_foi_construido_page_pt_and_en_TC018()
    print("TC018 passed successfully.")
