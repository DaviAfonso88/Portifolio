/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'DEP-1-domain-zero-deps',
      comment: 'Domain layer must have ZERO external dependencies and must not import any other monorepo package.',
      severity: 'error',
      from: {
        path: '^packages/domain/src',
        pathNot: '(__tests__|\\.spec\\.ts$)'
      },
      to: {
        pathNot: '^packages/domain',
        dependencyTypesNot: ['type-only', 'core']
      }
    },
    {
      name: 'DEP-2-application-only-domain',
      comment: 'Application layer can only import from Domain, not from Infrastructure, HTTP or Apps.',
      severity: 'error',
      from: {
        path: '^packages/application'
      },
      to: {
        path: '^(packages/(infrastructure|http|api-client)|apps)'
      }
    },
    {
      name: 'DEP-4-web-no-direct-infrastructure',
      comment: 'apps/web must not directly import packages/infrastructure, except via composition root or serverless route.',
      severity: 'error',
      from: {
        path: '^apps/web/(app|components)',
        pathNot: '^apps/web/lib/composition-root\\.ts|^apps/web/app/api'
      },
      to: {
        path: '^packages/infrastructure'
      }
    },
    {
      name: 'DEP-5-no-package-imports-apps-web',
      comment: 'No package may import from apps/web.',
      severity: 'error',
      from: {
        path: '^packages'
      },
      to: {
        path: '^apps/web'
      }
    },
    {
      name: 'no-circular-dependencies',
      comment: 'Circular dependencies are strictly forbidden across the monorepo.',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    }
  }
};
