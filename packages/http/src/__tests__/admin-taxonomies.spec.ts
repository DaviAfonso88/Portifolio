import { describe, expect, it, vi } from 'vitest';
import {
  CreateCategoryUseCase,
  CreateTagUseCase,
  UpdateCategoryUseCase,
  type TaxonomyRepository,
} from '@davidev/application';
import { Category, SlugValueObject, UUID } from '@davidev/domain';
import { buildApp } from '../app';
import { JwtTokenService } from '../services/jwt-token';

const CATEGORY_ID = UUID.create('01918a20-0000-7000-8000-000000000011');

describe('Admin taxonomy routes', () => {
  const tokenService = new JwtTokenService('test-secret-with-at-least-32-characters');
  const headers = {
    authorization: `Bearer ${tokenService.generateAccessToken({ id: 'admin', email: 'admin@test.local' } as never)}`,
  };

  function createFakeRepo(): TaxonomyRepository {
    return {
      createCategory: vi.fn(async () => undefined),
      updateCategory: vi.fn(async () => undefined),
      createTag: vi.fn(async () => undefined),
      findCategoryById: vi.fn(
        async () =>
          new Category({
            id: CATEGORY_ID,
            namePtBr: 'Antigo',
            nameEn: 'Old',
            slugPtBr: SlugValueObject.create('antigo'),
            slugEn: SlugValueObject.create('old'),
          })
      ),
    } as unknown as TaxonomyRepository;
  }

  async function buildTestApp(repo: TaxonomyRepository) {
    const app = await buildApp({
      tokenService,
      createCategoryUseCase: new CreateCategoryUseCase(repo),
      updateCategoryUseCase: new UpdateCategoryUseCase(repo),
      createTagUseCase: new CreateTagUseCase(repo),
    });
    await app.ready();
    return app;
  }

  it('cria categoria só com os nomes, como a tela envia', async () => {
    const repo = createFakeRepo();
    const app = await buildTestApp(repo);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/categories',
      headers,
      payload: { namePtBr: 'Automação', nameEn: 'Automation' },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().category).toMatchObject({ slugPtBr: 'automacao', slugEn: 'automation' });
    expect(repo.createCategory).toHaveBeenCalledTimes(1);
  });

  it('edita categoria só com os nomes e mantém os slugs', async () => {
    const app = await buildTestApp(createFakeRepo());

    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/admin/categories/${CATEGORY_ID}`,
      headers,
      payload: { namePtBr: 'Novo nome', nameEn: 'New name' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().category).toMatchObject({
      namePtBr: 'Novo nome',
      slugPtBr: 'antigo',
      slugEn: 'old',
    });
  });

  it('recusa nome maior que a coluna do banco', async () => {
    const repo = createFakeRepo();
    const app = await buildTestApp(repo);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/tags',
      headers,
      payload: { namePtBr: 'a'.repeat(41), nameEn: 'Valid' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().message).toBe('Nome em português excede 40 caracteres');
    expect(repo.createTag).not.toHaveBeenCalled();
  });
});
