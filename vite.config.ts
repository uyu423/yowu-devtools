import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { generateRoutes } from './vite-plugin-generate-routes';
import path from 'path';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

// Read package.json to get version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version;

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    generateRoutes(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'opengraph.png',
        'icon-192.png',
        'icon-512.png',
      ],
      // manifest 파일명을 manifest.json으로 설정 (호환성)
      manifestFilename: 'manifest.json',
      manifest: {
        name: "Yowu's DevTools",
        short_name: 'DevTools',
        description:
          'Free online developer tools: JSON viewer, cron parser, Base64 converter, URL encoder, text diff, YAML converter, and more. All processing happens in your browser.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['developer', 'utilities', 'productivity'],
        shortcuts: [
          {
            name: 'JSON Viewer',
            short_name: 'JSON',
            description: 'Pretty print and traverse JSON',
            url: '/json',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'URL Encoder',
            short_name: 'URL',
            description: 'Encode/Decode URL strings',
            url: '/url',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'Base64 Converter',
            short_name: 'Base64',
            description: 'Encode/Decode Base64 strings',
            url: '/base64',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'YAML Converter',
            short_name: 'YAML',
            description: 'Convert YAML to JSON and vice versa',
            url: '/yaml',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'Text Diff',
            short_name: 'Diff',
            description: 'Compare two text files',
            url: '/diff',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'Time Converter',
            short_name: 'Time',
            description: 'Convert between time formats',
            url: '/time',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'Cron Parser',
            short_name: 'Cron',
            description: 'Parse and validate cron expressions',
            url: '/cron',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'JWT Decoder',
            short_name: 'JWT',
            description: 'Decode and verify JWT tokens',
            url: '/jwt',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
        ],
        screenshots: [
          {
            src: '/screenshot-desktop-1.png',
            sizes: '1280x720',
            type: 'image/png',
            label: 'JSON Viewer - Desktop',
          },
          {
            src: '/screenshot-desktop-2.png',
            sizes: '1280x720',
            type: 'image/png',
            label: 'Command Palette - Desktop',
          },
          {
            src: '/screenshot-mobile-1.png',
            sizes: '390x844',
            type: 'image/png',
            label: 'Mobile View',
          },
          {
            src: '/screenshot-mobile-2.png',
            sizes: '390x844',
            type: 'image/png',
            label: 'Mobile Dark Mode',
          },
        ],
      },
      workbox: {
        // Network First 전략: 최신 버전 우선, 실패 시 캐시 사용
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tools\.yowu\.dev\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tools-yowu-dev-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3, // 3초 타임아웃
            },
          },
          // 정적 자산은 Cache First 전략 (빠른 로딩)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
              },
            },
          },
          // 폰트는 Cache First
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1년
              },
            },
          },
        ],
        // 정적 자산은 Cache First 전략 사용 (아이콘 포함)
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}',
          'icon-192.png',
          'icon-512.png',
        ],
        // 오프라인 폴백 페이지
        navigateFallback: '/404.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // 클린업: 오래된 캐시 자동 삭제
        cleanupOutdatedCaches: true,
        // NOTE: prompt 모드에서는 skipWaiting과 clientsClaim을 설정하면 안됨
        // 이 옵션들은 autoUpdate 모드에서만 자동으로 활성화됨
        // prompt 모드에서 설정하면 새 SW가 즉시 활성화되어 프롬프트가 표시되지 않음
      },
      // 개발 환경에서도 PWA 기능 테스트 가능 (localhost에서 설치 프롬프트 표시)
      devOptions: {
        enabled: true, // 개발 환경에서도 Service Worker 활성화 (localhost PWA 테스트용)
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
