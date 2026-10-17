import requests
import json
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_postapi_v1authloginwithinvalidcredentials():
    url = f"{BASE_URL}/api/v1/auth/login"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    # Use clearly invalid credentials to avoid accidental valid login
    payload = {
        "email": "nonexistent-user-for-testing@example.com",
        "password": "thisIsDefinitelyWrong123!"
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise AssertionError(f"HTTP request to {url} failed: {exc}") from exc

    # Validate status code is 401 Unauthorized
    assert resp.status_code == 401, f"Expected 401 Unauthorized, got {resp.status_code}. Response body: {resp.text}"

    # Prepare checks for disclosure and generic error message
    content_type = resp.headers.get("Content-Type", "")
    body_text = resp.text or ""
    forbidden_phrases = [
        "not found",
        "does not exist",
        "no user",
        "user not found",
        "email not found",
        "unknown user",
        "user does not exist",
        "no such user",
    ]
    generic_tokens = ["invalid", "credentials", "authentication", "unauthorized", "auth failed", "invalid credentials"]

    def contains_forbidden(text: str) -> str | None:
        low = text.lower()
        for phrase in forbidden_phrases:
            if phrase in low:
                return phrase
        return None

    def contains_generic(text: str) -> bool:
        low = text.lower()
        for token in generic_tokens:
            if token in low:
                return True
        return False

    # If JSON, parse and inspect keys/values
    if "application/json" in content_type.lower():
        try:
            data = resp.json()
        except ValueError as exc:
            raise AssertionError("Response indicated JSON but body could not be parsed as JSON") from exc

        serialized = json.dumps(data).lower()

        # Ensure no user-existence disclosure phrases present
        found = contains_forbidden(serialized)
        assert found is None, f"Response contains user-existence disclosure phrase '{found}': {serialized}"

        # Ensure there is a generic authentication error message present
        assert contains_generic(serialized), f"Response JSON does not contain a generic authentication message: {serialized}"

        # Ensure response does not include user profile data or identifiers
        for key in data.keys() if isinstance(data, dict) else []:
            lk = key.lower()
            assert "user" not in lk and "id" not in lk and "email" not in lk, f"Response JSON contains unexpected user-related field '{key}': {serialized}"

    else:
        # Non-JSON body: inspect raw text
        low_text = body_text.lower()
        found = contains_forbidden(low_text)
        assert found is None, f"Response contains user-existence disclosure phrase '{found}': {body_text}"
        assert contains_generic(low_text), f"Response text does not contain a generic authentication message: {body_text}"

    print("TC003 passed: POST /api/v1/auth/login with invalid credentials returned 401 and provided a generic authentication error without disclosing user existence.")


if __name__ == "__main__":
    try:
        test_postapi_v1authloginwithinvalidcredentials()
    except AssertionError as e:
        print(f"TC003 failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"TC003 encountered an unexpected error: {e}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)