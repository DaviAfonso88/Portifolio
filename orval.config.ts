import { defineConfig } from 'orval';

export default defineConfig({
  davidev: {
    input: {
      target: './specs/001-davidev-portfolio/contracts/openapi.yaml',
    },
    output: {
      target: './packages/api-client/src/generated.ts',
      client: 'fetch',
      baseUrl: '/api/v1',
    },
  },
});
