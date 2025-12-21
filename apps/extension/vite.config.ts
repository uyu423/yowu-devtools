import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './manifest.json';

export default defineConfig(({ mode }) => {
  // In production mode, exclude localhost from initiatorDomains
  // to avoid affecting other developers' localhost environments
  const isProduction = mode === 'production';

  return {
    plugins: [
      crx({ manifest }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@yowu-devtools/shared': resolve(__dirname, '../../packages/shared/src'),
      },
    },
    define: {
      // Inject build-time constant for initiator domains configuration
      __INCLUDE_LOCALHOST__: JSON.stringify(!isProduction),
    },
    build: {
      outDir: 'dist',
      emptyDirBeforeWrite: true,
      // CRXJS handles rollup input automatically from manifest
    },
  };
});
