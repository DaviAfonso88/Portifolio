import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:3000"

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def test_phase_3_blog_engine():
    # 1. Test GET /api/v1/posts
    req = urllib.request.Request(f"{BASE_URL}/api/v1/posts?locale=pt-BR")
    with urllib.request.urlopen(req) as resp:
        if resp.status != 200:
            raise AssertionError(f"Expected 200 for GET /api/v1/posts, got {resp.status}")
        data = json.loads(resp.read().decode('utf-8'))
        if "posts" not in data or not isinstance(data["posts"], list):
            raise AssertionError(f"Expected 'posts' array in response, got: {data}")
        if len(data["posts"]) == 0:
            raise AssertionError("Expected at least 1 published post in pt-BR")
    print("[PASS] GET /api/v1/posts: PASSED")

    # 2. Test GET /api/v1/posts/pt-BR/:slug (found)
    first_slug = data["posts"][0]["slug"]
    req = urllib.request.Request(f"{BASE_URL}/api/v1/posts/pt-BR/{first_slug}")
    with urllib.request.urlopen(req) as resp:
        if resp.status != 200:
            raise AssertionError(f"Expected 200 for GET /api/v1/posts/pt-BR/{first_slug}, got {resp.status}")
        post = json.loads(resp.read().decode('utf-8'))
        if post.get("slug") != first_slug:
            raise AssertionError(f"Expected post slug '{first_slug}', got '{post.get('slug')}'")
        if "content" not in post or not post["content"]:
            raise AssertionError("Expected post content to be present")
    print(f"[PASS] GET /api/v1/posts/pt-BR/{first_slug}: PASSED")

    # 3. Test BR-004: Historical slug redirect (HTTP 301)
    opener = urllib.request.build_opener(NoRedirectHandler)
    try:
        resp = opener.open(f"{BASE_URL}/api/v1/posts/pt-BR/slug-antigo-arquitetura")
        status = resp.status
        headers = dict(resp.headers)
    except urllib.error.HTTPError as e:
        status = e.code
        headers = dict(e.headers)

    if status != 301:
        raise AssertionError(f"Expected HTTP 301 for historical slug, got {status}")
    location = headers.get("Location") or headers.get("location")
    if not location or "por-que-a-arquitetura-hexagonal-se-pagou" not in location:
        raise AssertionError(f"Expected Location header with canonical slug, got '{location}'")
    print("[PASS] BR-004 Historical Slug 301 Redirect: PASSED")

    # 4. Test BR-006: Invisibility of drafts / nonexistent posts (HTTP 404)
    try:
        urllib.request.urlopen(f"{BASE_URL}/api/v1/posts/pt-BR/rascunho-secreto-inexistente")
        raise AssertionError("Expected HTTP 404 for draft/missing post, but request succeeded")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise AssertionError(f"Expected HTTP 404 for draft/missing post, got {e.code}")
    print("[PASS] BR-006 Invisibility of Drafts (404): PASSED")

    # 5. Test Taxonomies (categories and tags)
    with urllib.request.urlopen(f"{BASE_URL}/api/v1/categories") as resp:
        if resp.status != 200:
            raise AssertionError(f"Expected 200 for categories, got {resp.status}")
        cat_data = json.loads(resp.read().decode('utf-8'))
        if "categories" not in cat_data or len(cat_data["categories"]) == 0:
            raise AssertionError("Expected categories list")
    print("[PASS] GET /api/v1/categories: PASSED")

    with urllib.request.urlopen(f"{BASE_URL}/api/v1/tags") as resp:
        if resp.status != 200:
            raise AssertionError(f"Expected 200 for tags, got {resp.status}")
        tag_data = json.loads(resp.read().decode('utf-8'))
        if "tags" not in tag_data or len(tag_data["tags"]) == 0:
            raise AssertionError("Expected tags list")
    print("[PASS] GET /api/v1/tags: PASSED")

    # 6. Test sitemap.xml and robots.txt
    with urllib.request.urlopen(f"{BASE_URL}/sitemap.xml") as resp:
        body = resp.read().decode('utf-8')
        if resp.status != 200 or "urlset" not in body:
            raise AssertionError(f"Expected 200 and XML urlset for sitemap.xml")
    print("[PASS] GET /sitemap.xml: PASSED")

    with urllib.request.urlopen(f"{BASE_URL}/robots.txt") as resp:
        body = resp.read().decode('utf-8')
        if resp.status != 200 or "Disallow: /admin" not in body:
            raise AssertionError(f"Expected 200 and Disallow: /admin in robots.txt")
    print("[PASS] GET /robots.txt: PASSED")

    # 7. Test Public Blog Web Pages
    with urllib.request.urlopen(f"{BASE_URL}/pt-BR/blog") as resp:
        body = resp.read().decode('utf-8')
        if resp.status != 200 or "Notas de quem está construindo" not in body:
            raise AssertionError(f"Expected blog listing title in pt-BR")
    print("[PASS] GET /pt-BR/blog page: PASSED")

    with urllib.request.urlopen(f"{BASE_URL}/pt-BR/blog/por-que-a-arquitetura-hexagonal-se-pagou") as resp:
        body = resp.read().decode('utf-8')
        if resp.status != 200 or "arquitetura hexagonal" not in body.lower():
            raise AssertionError(f"Expected article reader page in pt-BR")
    print("[PASS] GET /pt-BR/blog/:slug article reader: PASSED")

if __name__ == "__main__":
    try:
        test_phase_3_blog_engine()
        print("\nALL PHASE 3 TESTSPRITE CHECKS PASSED (100%)")
        sys.exit(0)
    except AssertionError as e:
        print(f"\nPHASE 3 TESTSPRITE CHECK FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nPHASE 3 TESTSPRITE CHECK ERROR: {e}")
        sys.exit(2)
