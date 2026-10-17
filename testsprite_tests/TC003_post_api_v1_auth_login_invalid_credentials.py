import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_v1_auth_login_invalid_credentials():
    url = f"{BASE_URL}/api/v1/auth/login"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    payload = {
        "email": "nonexistent+tc003@example.com",
        "password": "IncorrectPassword123!"
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request to {url} failed: {e}") from e

    # Assert HTTP status code is 401 Unauthorized
    assert resp.status_code == 401, f"Expected 401 Unauthorized, got {resp.status_code}. Response text: {resp.text}"

    # Try to parse JSON response if possible
    content_type = resp.headers.get("Content-Type", "")
    body_text = resp.text or ""
    sensitive_indicators = [
        "user not found",
        "no user",
        "not registered",
        "does not exist",
        "not exist",
        "unknown user",
        "email not found",
        "email does not exist",
        "no account",
    ]

    tokens_fields = ["accessToken", "refreshToken", "token", "access_token", "refresh_token"]

    if "application/json" in content_type.lower() or body_text.strip().startswith("{"):
        try:
            body = resp.json()
        except ValueError:
            raise AssertionError("Response declared JSON but body could not be parsed as JSON")

        # Ensure no authentication tokens are returned on failure
        for t in tokens_fields:
            assert t not in body, f"Token field '{t}' should not be present in error response on failed login"

        # Ensure the error message does not disclose user existence
        message_candidates = []
        if isinstance(body, dict):
            # Common fields to check for messages
            for k in ("message", "error", "detail", "errors"):
                if k in body:
                    message_candidates.append(str(body[k]))
            # Also scan entire JSON string
            message_candidates.append(resp.text)
        else:
            message_candidates.append(str(body))

        combined_message = " ".join(message_candidates).lower()
        for indicator in sensitive_indicators:
            assert indicator not in combined_message, f"Error message discloses user existence: contains '{indicator}'"

    else:
        # Non-JSON responses: ensure body text does not disclose user existence nor include tokens
        lower_text = body_text.lower()
        for indicator in sensitive_indicators:
            assert indicator not in lower_text, f"Error message discloses user existence: contains '{indicator}'"
        for t in tokens_fields:
            assert t.lower() not in lower_text, f"Token string '{t}' should not be present in error response on failed login"

    return True


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_login_invalid_credentials()
        print("TC003 passed")
        sys.exit(0)
    except AssertionError as e:
        print(f"TC003 failed: {e}")
        sys.exit(1)