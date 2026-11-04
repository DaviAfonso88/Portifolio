import { test, expect } from '@playwright/test';

// Sem DATABASE_URL o servidor roda em memória e este admin de teste existe.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password';

test.describe('DaviDev — mensagens no CMS', () => {
  test.setTimeout(120000);

  test('a tela carrega as mensagens pela rota real da API', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#admin-email').click();
    await page.locator('#admin-email').fill(ADMIN_EMAIL);
    await page.locator('#admin-password').click();
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin\/posts/, { timeout: 15000 });

    const list = page.waitForResponse((res) =>
      /\/api\/v1\/admin\/messages\?.*limit=50/.test(res.url())
    );
    await page.goto('/admin/mensagens');

    expect((await list).status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Mensagens' })).toBeVisible();
    await expect(page.getByText('Não foi possível carregar as mensagens')).toHaveCount(0);
  });
});
