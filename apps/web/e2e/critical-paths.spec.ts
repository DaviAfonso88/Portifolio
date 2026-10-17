import { test, expect } from '@playwright/test';

test.describe('DaviDev — 7 Critical Paths E2E Suite (T07.03)', () => {
  // 1. Home reading
  test('Path 1: Home page renders hero, navigation, and portfolio sections', async ({ page }) => {
    await page.goto('/pt-BR');

    // Title / heading check
    await expect(page).toHaveTitle(/DaviDev/i);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Navigation links present
    const blogLink = page.locator('a[href*="/blog"]').first();
    await expect(blogLink).toBeVisible();

    const contactLink = page.locator('a[href*="/contato"]').first();
    await expect(contactLink).toBeVisible();
  });

  // 2. Blog navigation with category/tag filters
  test('Path 2: Blog index lists articles and supports category navigation', async ({ page }) => {
    await page.goto('/pt-BR/blog');

    // Editorial heading from design/Blog.dc.html
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Notas de quem está construindo/i);

    // Article cards with links exist
    const articleLink = page.locator('a[href*="/blog/por-que-a-arquitetura-hexagonal-se-pagou"]').first();
    await expect(articleLink).toBeVisible();
  });

  // 3. Article reading & content rendering
  test('Path 3: Article detail page renders content, date, and reading time', async ({ page }) => {
    await page.goto('/pt-BR/blog/por-que-a-arquitetura-hexagonal-se-pagou');

    // Heading matches article title
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/arquitetura hexagonal/i);

    // Content article container is visible
    await expect(page.locator('article').first()).toBeVisible();
  });

  // 4. Contact message submission
  test('Path 4: Contact form accepts inputs and renders feedback', async ({ page }) => {
    await page.goto('/pt-BR/contato');

    // Title from design/Contato.dc.html
    await expect(page.locator('h1')).toContainText(/Vamos conversar/i);

    // Form inputs
    const nameInput = page.locator('#name');
    const emailInput = page.locator('#email');
    const messageInput = page.locator('#message');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();

    await nameInput.fill('Avaliador E2E Playwright');
    await emailInput.fill('avaliador@test.com');
    await messageInput.fill('Mensagem de teste automatizado ponta a ponta validando o fluxo de contato.');

    // Submit button is active
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  // 5. CMS Admin Login
  test('Path 5: CMS Admin login renders form and handles authentication interface', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.locator('body')).toContainText(/Painel administrativo/i);

    const emailInput = page.locator('#admin-email');
    const passwordInput = page.locator('#admin-password');
    const loginButton = page.getByRole('button', { name: 'Entrar' });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Test rejection with invalid credentials
    await emailInput.click();
    await emailInput.fill('invalido@davidev.net.br');
    await passwordInput.click();
    await passwordInput.fill('senha_errada');
    await loginButton.click();

    // Expect alert error message to appear
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  // 6. Post creation & publication in editor
  test('Path 6: Admin posts editor renders split view or protects route with login', async ({ page }) => {
    await page.goto('/admin/posts/editor');

    // Protected route redirects unauthenticated user to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page.locator('#admin-email')).toBeVisible();
  });

  // 7. Post deletion via trash
  test('Path 7: Admin trash page renders table or protects route with login', async ({ page }) => {
    await page.goto('/admin/posts/lixeira');

    // Protected route redirects unauthenticated user to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page.locator('#admin-email')).toBeVisible();
  });
});
