import { test, expect, type Page } from '@playwright/test';

// Sem DATABASE_URL o servidor roda em memória e este admin de teste existe.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password';

// Aceita na hora: um alert aberto sem resposta trava o click que o disparou.
function acceptDialogs(page: Page): string[] {
  const messages: string[] = [];
  page.on('dialog', (dialog) => {
    messages.push(dialog.message());
    void dialog.accept();
  });
  return messages;
}

async function openTaxonomy(page: Page) {
  await page.goto('/admin/login');
  await page.locator('#admin-email').click();
  await page.locator('#admin-email').fill(ADMIN_EMAIL);
  await page.locator('#admin-password').click();
  await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/posts/, { timeout: 15000 });
  await page.goto('/admin/taxonomia');
  await expect(page.getByRole('heading', { name: 'Categorias e tags' })).toBeVisible();
}

test.describe('DaviDev — taxonomias no CMS', () => {
  test.setTimeout(120000);

  test('cria, edita e exclui categoria', async ({ page }) => {
    const id = Date.now();
    const name = `Categoria E2E ${id}`;
    const edited = `${name} editada`;
    const dialogs = acceptDialogs(page);

    await openTaxonomy(page);

    await page.getByRole('button', { name: 'Nova' }).first().click();
    await page.getByPlaceholder('Ex: Arquitetura').fill(name);
    await page.getByPlaceholder('Ex: Architecture').fill(`Category E2E ${id}`);
    await page.getByRole('button', { name: 'Salvar' }).click();
    const row = (text: string) => page.locator('div.grid', { hasText: text }).last();
    await expect(row(name)).toBeVisible({ timeout: 15000 });

    await row(name).getByTitle('Editar categoria').click();
    await page.getByPlaceholder('Ex: Arquitetura').fill(edited);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(row(edited)).toBeVisible({ timeout: 15000 });

    await row(edited).getByTitle('Excluir categoria').click();
    await expect(page.getByText(edited, { exact: true })).toHaveCount(0, { timeout: 15000 });
    expect(dialogs.filter((m) => !m.startsWith('Deseja excluir'))).toEqual([]);
  });

  test('cria, edita e exclui tag', async ({ page }) => {
    const id = Date.now();
    const name = `tag-e2e-${id}`;
    const edited = `${name}-editada`;
    const dialogs = acceptDialogs(page);

    await openTaxonomy(page);

    await page.getByRole('button', { name: 'Nova' }).last().click();
    await page.locator('form input').nth(0).fill(name);
    await page.locator('form input').nth(1).fill(`tag-en-${id}`);
    await page.getByRole('button', { name: 'Salvar' }).click();
    const pill = (text: string) => page.getByRole('button', { name: new RegExp(`^${text}\\s*0$`) });
    await expect(pill(name)).toBeVisible({ timeout: 15000 });

    await pill(name).click();
    await page.locator('form input').nth(0).fill(edited);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(pill(edited)).toBeVisible({ timeout: 15000 });

    await pill(edited).click();
    await page.getByRole('button', { name: 'Excluir tag' }).click();
    await expect(pill(edited)).toHaveCount(0, { timeout: 15000 });
    expect(dialogs.filter((m) => !m.startsWith('Deseja excluir'))).toEqual([]);
  });

  test('explica o bloqueio de categoria e tag em uso, mesmo com o artigo na lixeira', async ({
    page,
    request,
  }) => {
    const id = Date.now();
    const categoryName = `Em uso ${id}`;
    const tagName = `em-uso-${id}`;

    const login = await request.post('/api/v1/auth/login', {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(login.status()).toBe(200);
    const { accessToken } = await login.json();
    const headers = { authorization: `Bearer ${accessToken}` };

    const category = await request.post('/api/v1/admin/categories', {
      headers,
      data: { namePtBr: categoryName, nameEn: `In use ${id}` },
    });
    expect(category.status()).toBe(201);
    const categoryId = (await category.json()).category.id;

    const tag = await request.post('/api/v1/admin/tags', {
      headers,
      data: { namePtBr: tagName, nameEn: `in-use-${id}` },
    });
    expect(tag.status()).toBe(201);
    const tagId = (await tag.json()).tag.id;

    const post = await request.post('/api/v1/admin/posts', {
      headers,
      data: {
        locale: 'pt-BR',
        title: `Post em uso ${id}`,
        slug: `post-em-uso-${id}`,
        excerpt: 'Resumo',
        content: 'Conteúdo',
        categoryId,
        tagIds: [tagId],
      },
    });
    expect(post.status()).toBe(201);
    const postId = (await post.json()).id;
    expect((await request.patch(`/api/v1/admin/posts/${postId}/trash`, { headers })).status()).toBe(200);

    const dialogs = acceptDialogs(page);
    await openTaxonomy(page);

    // force: o Playwright não clica em aria-disabled, mas o botão continua clicável para mostrar o motivo.
    const row = page.locator('div.grid', { hasText: categoryName }).last();
    await row.getByTitle(/Não pode ser excluída/).click({ force: true });
    await expect.poll(() => dialogs.at(-1)).toContain(`A categoria “${categoryName}” está em 1 artigo`);

    await page.getByRole('button', { name: new RegExp(`^${tagName}\\s*1$`) }).click();
    await page.getByRole('button', { name: 'Excluir tag' }).click({ force: true });
    await expect.poll(() => dialogs.at(-1)).toContain(`A tag “${tagName}” está em 1 artigo`);
    await expect(row).toBeVisible();

    // Excluído o artigo de vez, os dois deixam de estar em uso.
    expect((await request.delete(`/api/v1/admin/posts/${postId}`, { headers })).status()).toBe(200);
    expect((await request.delete(`/api/v1/admin/categories/${categoryId}`, { headers })).status()).toBe(200);
    expect((await request.delete(`/api/v1/admin/tags/${tagId}`, { headers })).status()).toBe(200);
  });
});
