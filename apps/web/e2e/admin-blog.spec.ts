import { test, expect, type Page } from '@playwright/test';

// Sem DATABASE_URL o servidor roda em memória e estes admins de teste existem.
// Com banco, informe as credenciais e E2E_DATABASE=true para validar também as páginas públicas.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password';
const HAS_DATABASE = process.env.E2E_DATABASE === 'true';

// Aceita na hora: um alert aberto sem resposta trava o click que o disparou.
function acceptDialogs(page: Page): string[] {
  const messages: string[] = [];
  page.on('dialog', (dialog) => {
    messages.push(dialog.message());
    void dialog.accept();
  });
  return messages;
}

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.locator('#admin-email').click();
  await page.locator('#admin-email').fill(ADMIN_EMAIL);
  await page.locator('#admin-password').click();
  await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/posts/, { timeout: 15000 });
}

async function fillNewPost(page: Page, title: string, slug: string) {
  await page.goto('/admin/posts/editor');
  await expect(page.locator('select option').first()).toBeAttached({ timeout: 15000 });
  await page.getByPlaceholder('Título do artigo').fill(title);
  await page.getByPlaceholder('meu-artigo-slug').fill(slug);
  await page.getByPlaceholder('Resumo editorial do artigo...').fill('Resumo do artigo de teste');
  await page.getByPlaceholder('Escreva o artigo em Markdown aqui...').fill('## Seção\n\nTexto do artigo.');
}

async function publicSlugs(page: Page): Promise<string[]> {
  const res = await page.request.get('/api/v1/posts?locale=pt-BR&limit=50');
  expect(res.ok()).toBe(true);
  return (await res.json()).posts.map((p: { slug: string }) => p.slug);
}

async function sitemapXml(page: Page): Promise<string> {
  const res = await page.request.get('/sitemap.xml');
  expect(res.ok()).toBe(true);
  return res.text();
}

async function moveToTrash(page: Page, title: string) {
  await page.goto('/admin/posts');
  const row = page.locator('div.grid', { hasText: title }).first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.getByRole('button', { name: 'Ações do artigo' }).click();
  await page.getByRole('button', { name: 'Mover para lixeira' }).click();
  await expect(page.getByRole('link', { name: title })).toHaveCount(0, { timeout: 15000 });
}

test.describe('DaviDev — CMS do blog', () => {
  test.setTimeout(120000);

  test('publica artigo com tag, edita, move para a lixeira, restaura e exclui', async ({ page }) => {
    const id = Date.now();
    const title = `Artigo E2E ${id}`;
    const slug = `artigo-e2e-${id}`;
    const editedTitle = `${title} editado`;

    const dialogs = acceptDialogs(page);

    await login(page);

    // Publicar direto, com tag selecionada
    await fillNewPost(page, title, slug);
    await page.getByRole('button', { name: '+ tag' }).click();
    await page.locator('div.max-h-36 button').first().click();
    await page.getByRole('button', { name: 'Publicar' }).click();

    // O editor recarrega o post salvo, com os campos preenchidos
    await expect(page).toHaveURL(/editor\?id=/, { timeout: 15000 });
    await expect(page.getByPlaceholder('Título do artigo')).toHaveValue(title, { timeout: 15000 });
    await expect(page.getByPlaceholder('meu-artigo-slug')).toHaveValue(slug);
    await expect(page.getByText('Publicado', { exact: true }).first()).toBeVisible();
    expect(await publicSlugs(page)).toContain(slug);

    // A página pública entra no cache antes da edição, para provar a invalidação depois
    if (HAS_DATABASE) {
      await page.goto(`/pt-BR/blog/${slug}`);
      await expect(page.locator('h1')).toContainText(title);
      expect(await sitemapXml(page)).toContain(`/pt-BR/blog/${slug}`);
      await page.goBack();
    }

    // Editar um post publicado cria uma nova versão
    await expect(page.getByPlaceholder('Título do artigo')).toHaveValue(title, { timeout: 15000 });
    await page.getByPlaceholder('Título do artigo').fill(editedTitle);
    await page.getByRole('button', { name: 'Atualizar publicação' }).click();
    await expect(page.getByText('v2').first()).toBeVisible({ timeout: 15000 });

    if (HAS_DATABASE) {
      await page.goto(`/pt-BR/blog/${slug}`);
      await expect(page.locator('h1')).toContainText(editedTitle);
    }

    // As abas de status filtram pelo valor real
    await page.goto('/admin/posts');
    await expect(page.getByRole('link', { name: editedTitle })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Rascunhos' }).click();
    await expect(page.getByRole('link', { name: editedTitle })).toHaveCount(0, { timeout: 15000 });
    await page.getByRole('button', { name: 'Publicados' }).click();
    await expect(page.getByRole('link', { name: editedTitle })).toBeVisible({ timeout: 15000 });

    // Lixeira: sai do blog e da lista, aparece na tela da lixeira
    await moveToTrash(page, editedTitle);
    expect(await publicSlugs(page)).not.toContain(slug);
    if (HAS_DATABASE) {
      const trashed = await page.goto(`/pt-BR/blog/${slug}`);
      expect(trashed?.status()).toBe(404);
      expect(await sitemapXml(page)).not.toContain(`/pt-BR/blog/${slug}`);
    }

    await page.goto('/admin/posts/lixeira');
    await expect(page.getByText(editedTitle)).toBeVisible({ timeout: 15000 });

    // Restaurar devolve o post ao blog
    await page
      .locator('div.grid', { hasText: editedTitle })
      .getByRole('button', { name: 'Restaurar', exact: true })
      .click();
    await expect(page.getByText(editedTitle)).toHaveCount(0, { timeout: 15000 });
    expect(await publicSlugs(page)).toContain(slug);

    // Excluir de vez a partir da lixeira
    await moveToTrash(page, editedTitle);
    await page.goto('/admin/posts/lixeira');
    await page.locator('div.grid', { hasText: editedTitle }).getByRole('button', { name: 'Excluir definitivamente' }).click();
    await page.getByRole('button', { name: 'Excluir definitivamente' }).last().click();
    await expect(page.getByText(editedTitle)).toHaveCount(0, { timeout: 15000 });

    expect(await publicSlugs(page)).not.toContain(slug);
    expect(dialogs.filter((m) => !m.startsWith('Deseja mover'))).toEqual([]);
  });

  test('artigo inexistente responde 404, mesmo sem nada publicado no build', async ({ page }) => {
    const res = await page.goto('/pt-BR/blog/artigo-que-nao-existe');
    expect(res?.status()).toBe(404);
  });

  test('salva rascunho sem publicar e publica depois', async ({ page }) => {
    const id = Date.now();
    const title = `Rascunho E2E ${id}`;
    const slug = `rascunho-e2e-${id}`;

    acceptDialogs(page);
    await login(page);
    await fillNewPost(page, title, slug);
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();

    await expect(page).toHaveURL(/editor\?id=/, { timeout: 15000 });
    await expect(page.getByPlaceholder('Título do artigo')).toHaveValue(title, { timeout: 15000 });
    await expect(page.getByText('Rascunho', { exact: true }).first()).toBeVisible();
    expect(await publicSlugs(page)).not.toContain(slug);

    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByRole('button', { name: 'Atualizar publicação' })).toBeVisible({ timeout: 15000 });
    expect(await publicSlugs(page)).toContain(slug);

    await moveToTrash(page, title);
    await page.goto('/admin/posts/lixeira');
    await page.locator('div.grid', { hasText: title }).getByRole('button', { name: 'Excluir definitivamente' }).click();
    await page.getByRole('button', { name: 'Excluir definitivamente' }).last().click();
    await expect(page.getByText(title)).toHaveCount(0, { timeout: 15000 });
  });

  test('mostra o erro da API ao repetir um slug', async ({ page }) => {
    const id = Date.now();
    const slug = `slug-repetido-${id}`;

    const dialogs = acceptDialogs(page);
    await login(page);
    await fillNewPost(page, `Primeiro ${id}`, slug);
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page).toHaveURL(/editor\?id=/, { timeout: 15000 });

    await fillNewPost(page, `Segundo ${id}`, slug);
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect.poll(() => dialogs.join('\n')).toContain('já está em uso');
  });
});
