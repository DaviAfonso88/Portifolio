import { buildApp, type FastifyInstance, JwtTokenService } from '@davidev/http';
import {
  SubmitContactMessageUseCase,
  ListPublishedPostsUseCase,
  GetPostBySlugUseCase,
  ListTaxonomiesUseCase,
  AdminLoginUseCase,
  RefreshSessionUseCase,
  LogoutUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  CreateTagUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  PublishPostUseCase,
  UnpublishPostUseCase,
  MovePostToTrashUseCase,
  RestorePostFromTrashUseCase,
  DeletePostPermanentlyUseCase,
  ListAdminPostsUseCase,
  GetAdminPostUseCase,
  ListPostVersionsUseCase,
  ListContactMessagesUseCase,
  PurgeOldContactMessagesUseCase,
} from '@davidev/application';

import {
  createDbClient,
  DrizzleContactMessageRepository,
  DrizzlePostRepository,
  DrizzleAdminUserRepository,
  DrizzleRefreshTokenRepository,
  BcryptPasswordHasher,
  TurnstileCaptchaService,
  ResendEmailService,
  PostgresRateLimiter,
} from '@davidev/infrastructure';

let cachedApp: FastifyInstance | null = null;
let postRepoInstance: DrizzlePostRepository | null = null;
let contactRepoInstance: DrizzleContactMessageRepository | null = null;
let blogUseCasesInstance: {
  listPublishedPosts: ListPublishedPostsUseCase;
  getPostBySlug: GetPostBySlugUseCase;
  listTaxonomies: ListTaxonomiesUseCase;
} | null = null;

let adminUseCasesInstance: {
  listAdminPosts: ListAdminPostsUseCase;
  getAdminPost: GetAdminPostUseCase;
  createPost: CreatePostUseCase;
  updatePost: UpdatePostUseCase;
  publishPost: PublishPostUseCase;
  unpublishPost: UnpublishPostUseCase;
  movePostToTrash: MovePostToTrashUseCase;
  restorePostFromTrash: RestorePostFromTrashUseCase;
  deletePostPermanently: DeletePostPermanentlyUseCase;
  createCategory: CreateCategoryUseCase;
  updateCategory: UpdateCategoryUseCase;
  deleteCategory: DeleteCategoryUseCase;
  createTag: CreateTagUseCase;
  updateTag: UpdateTagUseCase;
  deleteTag: DeleteTagUseCase;
  listPostVersions: ListPostVersionsUseCase;
  listContactMessages: ListContactMessagesUseCase;
  purgeOldContactMessages: PurgeOldContactMessagesUseCase;
  repo: DrizzlePostRepository;

  contactRepo: DrizzleContactMessageRepository;
} | null = null;

function getPostRepository(): DrizzlePostRepository {
  if (postRepoInstance) return postRepoInstance;

  if (process.env.DATABASE_URL) {
    try {
      const db = createDbClient(process.env.DATABASE_URL);
      postRepoInstance = new DrizzlePostRepository(db);
      return postRepoInstance;
    } catch (err) {
      console.warn('[CompositionRoot] Warning: DB connection failed, using fallback post repo:', err);
    }
  }

  postRepoInstance = new DrizzlePostRepository();
  return postRepoInstance;
}

function getContactRepository(): DrizzleContactMessageRepository {
  if (contactRepoInstance) return contactRepoInstance;

  if (process.env.DATABASE_URL) {
    try {
      const db = createDbClient(process.env.DATABASE_URL);
      contactRepoInstance = new DrizzleContactMessageRepository(db);
      return contactRepoInstance;
    } catch (err) {
      console.warn('[CompositionRoot] Warning: DB connection failed, using fallback contact repo:', err);
    }
  }

  contactRepoInstance = new DrizzleContactMessageRepository();
  return contactRepoInstance;
}

export function getBlogUseCases() {
  if (blogUseCasesInstance) return blogUseCasesInstance;

  const repo = getPostRepository();
  blogUseCasesInstance = {
    listPublishedPosts: new ListPublishedPostsUseCase(repo),
    getPostBySlug: new GetPostBySlugUseCase(repo),
    listTaxonomies: new ListTaxonomiesUseCase(repo),
  };

  return blogUseCasesInstance;
}

export function getAdminUseCases() {
  if (adminUseCasesInstance) return adminUseCasesInstance;

  const repo = getPostRepository();
  const contactRepo = getContactRepository();

  adminUseCasesInstance = {
    listAdminPosts: new ListAdminPostsUseCase(repo),
    getAdminPost: new GetAdminPostUseCase(repo),
    createPost: new CreatePostUseCase(repo),
    updatePost: new UpdatePostUseCase(repo),
    publishPost: new PublishPostUseCase(repo),
    unpublishPost: new UnpublishPostUseCase(repo),
    movePostToTrash: new MovePostToTrashUseCase(repo),
    restorePostFromTrash: new RestorePostFromTrashUseCase(repo),
    deletePostPermanently: new DeletePostPermanentlyUseCase(repo),
    createCategory: new CreateCategoryUseCase(repo),
    updateCategory: new UpdateCategoryUseCase(repo),
    deleteCategory: new DeleteCategoryUseCase(repo),
    createTag: new CreateTagUseCase(repo),
    updateTag: new UpdateTagUseCase(repo),
    deleteTag: new DeleteTagUseCase(repo),
    listPostVersions: new ListPostVersionsUseCase(repo),
    listContactMessages: new ListContactMessagesUseCase(contactRepo),
    purgeOldContactMessages: new PurgeOldContactMessagesUseCase(contactRepo),
    repo,
    contactRepo,

  };

  return adminUseCasesInstance;
}

export async function getOrCreateApp(): Promise<FastifyInstance> {
  if (cachedApp) return cachedApp;

  let submitContactUseCase: SubmitContactMessageUseCase | undefined;
  let db: ReturnType<typeof createDbClient> | undefined;

  // Initialize DB if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      db = createDbClient(process.env.DATABASE_URL);
      const contactRepo = new DrizzleContactMessageRepository(db);
      const captchaService = new TurnstileCaptchaService(process.env.TURNSTILE_SECRET_KEY);
      const emailService = new ResendEmailService(
        process.env.RESEND_API_KEY,
        process.env.CONTACT_ALERT_EMAIL
      );

      submitContactUseCase = new SubmitContactMessageUseCase(
        contactRepo,
        captchaService,
        emailService
      );
    } catch (err) {
      console.warn('[CompositionRoot] Warning: Could not initialize full DB client for Fastify:', err);
    }
  }

  const blog = getBlogUseCases();
  const admin = getAdminUseCases();

  // Auth adapters and use cases
  const adminUserRepo = new DrizzleAdminUserRepository(db);
  const refreshTokenRepo = new DrizzleRefreshTokenRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(
    process.env.JWT_SECRET || 'davidev-insecure-default-secret-key-32chars'
  );

  const adminLoginUseCase = new AdminLoginUseCase(
    adminUserRepo,
    refreshTokenRepo,
    passwordHasher,
    tokenService
  );
  const refreshSessionUseCase = new RefreshSessionUseCase(
    adminUserRepo,
    refreshTokenRepo,
    tokenService
  );
  const logoutUseCase = new LogoutUseCase(refreshTokenRepo, tokenService);

  cachedApp = await buildApp({
    submitContactUseCase,
    listPublishedPostsUseCase: blog.listPublishedPosts,
    getPostBySlugUseCase: blog.getPostBySlug,
    listTaxonomiesUseCase: blog.listTaxonomies,
    adminLoginUseCase,
    refreshSessionUseCase,
    logoutUseCase,
    tokenService,
    rateLimiter: new PostgresRateLimiter(db),
    // Admin CMS routes
    taxonomyRepo: admin.repo,
    createCategoryUseCase: admin.createCategory,
    updateCategoryUseCase: admin.updateCategory,
    deleteCategoryUseCase: admin.deleteCategory,
    createTagUseCase: admin.createTag,
    updateTagUseCase: admin.updateTag,
    deleteTagUseCase: admin.deleteTag,
    listAdminPostsUseCase: admin.listAdminPosts,
    getAdminPostUseCase: admin.getAdminPost,
    createPostUseCase: admin.createPost,
    updatePostUseCase: admin.updatePost,
    publishPostUseCase: admin.publishPost,
    unpublishPostUseCase: admin.unpublishPost,
    movePostToTrashUseCase: admin.movePostToTrash,
    restorePostFromTrashUseCase: admin.restorePostFromTrash,
    deletePostPermanentlyUseCase: admin.deletePostPermanently,
    listPostVersionsUseCase: admin.listPostVersions,
    listContactMessagesUseCase: admin.listContactMessages,
    contactRepo: admin.contactRepo,
  });

  await cachedApp.ready();
  return cachedApp;
}
