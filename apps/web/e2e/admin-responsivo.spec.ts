import { test, expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

// Sem DATABASE_URL o servidor roda em memória e este admin de teste existe.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password';

const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.locator('#admin-email').click();
  await page.locator('#admin-email').fill(ADMIN_EMAIL);
  await page.locator('#admin-password').click();
  await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/posts/, { timeout: 15000 });
}

async function apiHeaders(request: APIRequestContext) {
  const res = await request.post('/api/v1/auth/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.status()).toBe(200);
  return { authorization: `Bearer ${(await res.json()).accessToken}` };
}

async function createPost(request: APIRequestContext, title: string) {
  const headers = await apiHeaders(request);
  const categories = await (await request.get('/api/v1/admin/categories', { headers })).json();
  const res = await request.post('/api/v1/admin/posts', {
    headers,
    data: {
      locale: 'pt-BR',
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      excerpt: 'Resumo',
      content: 'Conteúdo',
      categoryId: categories.categories[0].id,
      publishImmediately: true,
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  return { id: (body.id ?? body.post.id) as string, headers };
}

async function removePost(
  request: APIRequestContext,
  { id, headers }: { id: string; headers: Record<string, string> }
) {
  await request.patch(`/api/v1/admin/posts/${id}/trash`, { headers });
  await request.delete(`/api/v1/admin/posts/${id}`, { headers });
}

// Confere o ponto da tela: um item cortado por overflow continua "visível" para o Playwright.
async function expectOnScreen(locator: Locator) {
  await expect(locator).toBeInViewport({ ratio: 1 });
  const reachable = await locator.evaluate((el) => {
    const { left, top, bottom, width } = el.getBoundingClientRect();
    const x = left + width / 2;
    return [top + 2, bottom - 2].every((y) => {
      const hit = document.elementFromPoint(x, y);
      return !!hit && (hit === el || el.contains(hit));
    });
  });
  expect(reachable).toBe(true);
}

async function expectNoSideScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function filterPostsBy(page: Page, title: string) {
  await page.goto('/admin/posts');
  await page.getByPlaceholder('Buscar por título').fill(title);
  await expect(page.getByRole('button', { name: 'Ações do artigo' })).toHaveCount(1, {
    timeout: 15000,
  });
}

test.describe('DaviDev — painel em qualquer tela', () => {
  test.setTimeout(120000);

  test('o menu de ações aparece inteiro com um único artigo na lista', async ({ page, request }) => {
    const title = `Menu unico ${Date.now()}`;
    const post = await createPost(request, title);

    await login(page);
    await filterPostsBy(page, title);

    const menu = page.getByRole('button', { name: 'Ações do artigo' });
    await menu.click();
    await expectOnScreen(page.getByRole('link', { name: 'Editar' }));
    await expectOnScreen(page.getByRole('button', { name: 'Despublicar' }));
    await expectOnScreen(page.getByRole('button', { name: 'Mover para lixeira' }));

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Mover para lixeira' })).toHaveCount(0);

    await menu.click();
    await page.getByRole('heading', { name: 'Artigos' }).click();
    await expect(page.getByRole('button', { name: 'Mover para lixeira' })).toHaveCount(0);

    await removePost(request, post);
  });

  test.describe('tela baixa de desktop', () => {
    test.use({ viewport: { width: 1280, height: 600 } });

    test('a coluna de detalhes do editor rola até o fim', async ({ page, request }) => {
      const post = await createPost(request, `Coluna ${Date.now()}`);

      await login(page);
      await page.goto(`/admin/posts/editor?id=${post.id}`);
      await page.getByPlaceholder('meu-artigo-slug').hover();
      await page.mouse.wheel(0, 2000);
      await expectOnScreen(page.getByRole('button', { name: /Ver histórico de versões/ }));

      await removePost(request, post);
    });
  });

  test.describe('celular em paisagem', () => {
    test.use({ viewport: { width: 667, height: 375 } });

    test('o modal de exclusão cabe na tela e os botões ficam ao alcance', async ({ page, request }) => {
      const title = `Modal baixo ${Date.now()}`;
      const post = await createPost(request, title);
      await request.patch(`/api/v1/admin/posts/${post.id}/trash`, { headers: post.headers });

      await login(page);
      await page.goto('/admin/posts/lixeira');
      await page
        .locator('div.grid', { hasText: title })
        .getByRole('button', { name: 'Excluir definitivamente' })
        .click();

      const dialog = page.getByRole('dialog');
      const box = await dialog.boundingBox();
      expect(box!.height).toBeLessThanOrEqual(375);

      await dialog.hover();
      await page.mouse.wheel(0, 2000);
      await expectOnScreen(dialog.getByRole('button', { name: 'Excluir definitivamente' }));

      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);

      await request.delete(`/api/v1/admin/posts/${post.id}`, { headers: post.headers });
    });
  });

  test.describe('celular em paisagem, com toque', () => {
    test.use({ viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true });

    test('o menu de ações não fica atrás da barra superior', async ({ page, request }) => {
      const title = `Menu barra ${Date.now()}`;
      const post = await createPost(request, title);

      await login(page);
      await filterPostsBy(page, title);

      // Põe o botão onde a folga é curta dos dois lados, sem depender do tamanho da lista.
      const menu = page.getByRole('button', { name: 'Ações do artigo' });
      await page.evaluate(() => {
        document.body.style.paddingBottom = '1000px';
      });
      await menu.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 180));
      await menu.click();

      await expectOnScreen(page.getByRole('link', { name: 'Editar' }));
      await expectOnScreen(page.getByRole('button', { name: 'Despublicar' }));
      await expectOnScreen(page.getByRole('button', { name: 'Mover para lixeira' }));

      await removePost(request, post);
    });
  });

  test.describe('celular', () => {
    test.use(PHONE);

    test('exclui um artigo do começo ao fim', async ({ page, request }) => {
      const title = `Celular ${Date.now()}`;
      const post = await createPost(request, title);
      page.on('dialog', (dialog) => void dialog.accept());

      await login(page);
      await filterPostsBy(page, title);
      await expectNoSideScroll(page);

      await page.getByRole('button', { name: 'Ações do artigo' }).click();
      await expectOnScreen(page.getByRole('button', { name: 'Mover para lixeira' }));
      await page.getByRole('button', { name: 'Mover para lixeira' }).click();
      await expect(page.getByRole('link', { name: title })).toHaveCount(0, { timeout: 15000 });

      await page.getByRole('button', { name: 'Abrir menu' }).click();
      await page.getByRole('link', { name: /^Lixeira/ }).click();
      await expect(page).toHaveURL(/\/admin\/posts\/lixeira/);
      await expectNoSideScroll(page);

      await page
        .locator('div.grid', { hasText: title })
        .getByRole('button', { name: 'Excluir definitivamente' })
        .click();
      const confirm = page.getByRole('dialog').getByRole('button', { name: 'Excluir definitivamente' });
      await expectOnScreen(confirm);
      await confirm.click();
      await expect(page.getByText(title)).toHaveCount(0, { timeout: 15000 });

      const gone = await request.get(`/api/v1/admin/posts/${post.id}`, { headers: post.headers });
      expect(gone.status()).toBe(404);
    });

    test('a navegação abre como gaveta e devolve o foco ao fechar', async ({ page }) => {
      await login(page);

      const lixeira = page.getByRole('link', { name: /^Lixeira/ });
      const openMenu = page.getByRole('button', { name: 'Abrir menu' });
      await expect(lixeira).toHaveCount(0);

      await openMenu.click();
      await expect(lixeira).toBeInViewport({ ratio: 1 });
      await expect(page.getByRole('button', { name: 'Fechar menu' })).toBeFocused();
      await expect(page.locator('main').locator('xpath=..')).toHaveAttribute('inert', '');

      await page.keyboard.press('Escape');
      await expect(lixeira).toHaveCount(0);
      await expect(openMenu).toBeFocused();

      await openMenu.click();
      await page.mouse.click(370, 500);
      await expect(lixeira).toHaveCount(0);
    });

    test('o editor mostra uma área por vez', async ({ page }) => {
      await login(page);
      await page.goto('/admin/posts/editor');
      await expectNoSideScroll(page);

      const markdown = page.getByPlaceholder('Escreva o artigo em Markdown aqui...');
      const slug = page.getByPlaceholder('meu-artigo-slug');
      await expect(markdown).toBeVisible();
      await expect(slug).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Split' })).toHaveCount(0);

      await page.getByRole('button', { name: 'Detalhes' }).click();
      await expect(slug).toBeVisible();
      await expect(markdown).toHaveCount(0);

      await page.getByRole('button', { name: 'Preview' }).click();
      await expect(page.getByText('mesmo componente da página pública')).toBeVisible();
      await expect(slug).toHaveCount(0);
    });

    test('a mensagem aberta substitui a lista, com caminho de volta', async ({ page }) => {
      // Sem banco, o formulário público não grava onde o painel lê; por isso a lista é simulada.
      const name = 'Visitante de teste';
      await page.route('**/api/v1/admin/messages?*', (route) =>
        route.fulfill({
          json: {
            messages: [
              {
                id: 'mensagem-de-teste',
                name,
                email: 'visitante@exemplo.com',
                subject: 'Assunto de teste',
                message: 'Mensagem de teste da tela de celular.',
                locale: 'pt-BR',
                emailNotifiedAt: null,
                createdAt: new Date().toISOString(),
              },
            ],
            total: 1,
            unnotifiedCount: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        })
      );

      await login(page);
      await page.goto('/admin/mensagens');
      const item = page.getByRole('button', { name: new RegExp(name) });
      await item.click();

      const back = page.getByRole('button', { name: 'Voltar para a lista' });
      await expect(back).toBeVisible();
      await expect(item).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Responder por e-mail' })).toBeVisible();
      await expectNoSideScroll(page);

      await back.click();
      await expect(item).toBeVisible();
    });
  });
});
