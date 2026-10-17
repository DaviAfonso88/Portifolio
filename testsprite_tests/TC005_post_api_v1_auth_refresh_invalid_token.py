import requests
import json
import sys

BASE_URL = "http://localhost:3000"
ENDPOINT = f"{BASE_URL}/api/v1/auth/refresh"
DEFAULT_HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    # Instruct server to behave as production per test instructions
    "X-Server-Mode": "production",
}
REQUEST_TIMEOUT = 30


def test_post_api_v1_auth_refresh_invalid_token():
    """
    TC005: Verify that POST /api/v1/auth/refresh with expired or malformed token
    returns 401 with an authentication error response.
    """

    test_cases = [
        {
            "name": "malformed_refresh_token_in_body",
            "request_kwargs": {
                "json": {"refreshToken": "malformed.token.value"},
                "headers": DEFAULT_HEADERS,
                "timeout": REQUEST_TIMEOUT,
            },
        },
        {
            "name": "malformed_bearer_token_in_authorization_header",
            "request_kwargs": {
                "headers": {**DEFAULT_HEADERS, "Authorization": "Bearer malformed.token.value"},
                "timeout": REQUEST_TIMEOUT,
            },
        },
    ]

    for case in test_cases:
        name = case["name"]
        kwargs = case["request_kwargs"]

        try:
            resp = requests.post(ENDPOINT, **kwargs)
        except requests.RequestException as e:
            raise AssertionError(f"[{name}] HTTP request failed: {e}") from e

        # Assert expected 401 Unauthorized
        if resp.status_code != 401:
            raise AssertionError(
                f"[{name}] Expected status code 401 but got {resp.status_code}. Response body: {resp.text}"
            )

        # Try to validate that the response contains authentication-related error information
        body_text = None
        try:
            body_json = resp.json()
            body_text = json.dumps(body_json).lower()
        except ValueError:
            # Not JSON - fall back to plain text
            body_text = (resp.text or "").lower()

        if not body_text:
            raise AssertionError(f"[{name}] Empty response body for 401 response")

        # Expect some mention of authentication/token/unauthorized/invalid/expired in the response
        expected_indicators = [
            "auth",
            "authentication",
            "unauthor",
            "unauthorized",
            "token",
            "refresh",
            "invalid",
            "expired",
            "error",
            "credentials",
        ]
        if not any(ind in body_text for ind in expected_indicators):
            raise AssertionError(
                f"[{name}] 401 response did not include expected authentication error details. Body: {body_text}"
            )

    print("TC005 passed: POST /api/v1/auth/refresh returned 401 with authentication error details for invalid/malformed tokens.")


if __name__ == "__main__":
    try:
        test_post_api_v1_auth_refresh_invalid_token()
    except AssertionError as e:
        print("TEST FAILED:", e, file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print("UNEXPECTED ERROR:", e, file=sys.stderr)
        sys.exit(2)
    else:
        sys.exit(0)