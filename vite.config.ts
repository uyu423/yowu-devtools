import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { generateRoutes } from './vite-plugin-generate-routes';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    generateRoutes(),
    VitePWA({
      registerType: 'autoUpdate',
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
        // 클라이언트 클레임: 즉시 제어권 획득
        clientsClaim: true,
        // 스킵 웨이팅: 새 Service Worker 즉시 활성화
        skipWaiting: true,
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
