import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.SCHEMA_URL ?? 'http://localhost:8000/graphql/',
  documents: ['src/**/*.{ts,tsx,graphql}', '!src/graphql/generated/**'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        scalars: {
          Decimal: 'string',
          DateTime: 'string',
          Date: 'string',
          Time: 'string',
          JSON: 'Record<string, unknown>',
          Upload: 'File',
        },
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
};
export default config;
