import requests
import uuid
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_v1_auth_login_invalid_credentials():
    url = f"{BASE_URL}/api/v1/auth/login"
    # Use a likely-nonexistent email to avoid accidental valid credentials
    fake_email = f"no-such-user-{uuid.uuid4().hex}@example.com"
    payload = {
        "email": fake_email,
        "password": "IncorrectPassword!234"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")

    # 1) Expect HTTP 401 Unauthorized for invalid credentials
    assert resp.status_code == 401, f"Expected status 401, got {resp.status_code}. Response body: {resp.text!r}"

    # 2) Expect JSON response (or at least application/json content-type)
    content_type = resp.headers.get("Content-Type", "")
    assert "application/json" in content_type.lower(), f"Expected JSON response content-type, got: {content_type!r}"

    # 3) Ensure response contains a generic authentication error and does NOT disclose user existence
    body_text = ""
    try:
        body = resp.json()
        # Try to extract a human message if present
        if isinstance(body, dict):
            # Preferred keys
            for key in ("message", "error", "detail", "errors"):
                if key in body:
                    val = body[key]
                    if isinstance(val, (list, dict)):
                        body_text = str(val)
                    else:
                        body_text = str(val)
                    break
            else:
                body_text = str(body)
        else:
            body_text = str(body)
    except ValueError:
        # Not valid JSON despite content-type; fallback to raw text
        body_text = resp.text or ""

    lowered = body_text.lower()

    # Generic authentication indicator: support English and Portuguese messages
    generic_indicators = [
        # English
        "invalid",
        "invalid credentials",
        "unauthorized",
        "authentication",
        "credentials",
        "failed",
        "forbidden",
        # Portuguese
        "inválido",
        "inválida",
        "inválidos",
        "inválidas",
        "credenciais inválidas",
        "credenciais incorretas",
        "credenciais",
        "autenticação",
        "autenticacao",
        "não autorizado",
        "nao autorizado",
        "senha incorreta",
    ]
    assert any(ind in lowered for ind in generic_indicators), (
        f"Response did not contain a generic authentication indicator. Response body: {body_text!r}"
    )

    # Disallowed phrases that would disclose user existence (English + Portuguese)
    disallowed_phrases = [
        # English
        "user not found",
        "no user",
        "does not exist",
        "no account",
        "email not registered",
        "user does not exist",
        "unknown user",
        "not registered",
        "account does not exist",
        "account not found",
        # Portuguese
        "usuário não encontrado",
        "usuario nao encontrado",
        "usuário nao encontrado",
        "usuario não encontrado",
        "usuario nao existe",
        "usuário não existe",
        "nao existe",
        "não existe",
        "não cadastrado",
        "nao cadastrado",
        "email não registrado",
        "email nao registrado",
        "conta não encontrada",
        "conta nao encontrada",
    ]
    for phrase in disallowed_phrases:
        assert phrase not in lowered, f"Response discloses user-existence with phrase {phrase!r}. Body: {body_text!r}"

    # If we reach here, the test passes
    print("TC003 passed: POST /api/v1/auth/login with invalid credentials returned 401 and did not disclose user existence.")


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_login_invalid_credentials()
    except AssertionError as e:
        print(f"TC003 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC003 unexpected error: {e}")
        sys.exit(2)
    sys.exit(0)