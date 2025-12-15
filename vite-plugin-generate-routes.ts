import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type LocaleCode,
} from './src/lib/constants';

// package.json에서 버전 정보 읽기
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version;

// 도구 정보 타입
interface ToolInfo {
  id: string;
  path: string;
  title: string;
  description: string;
  seoDescription: string;
  keywords: string[];
  features: string[];
}

// 도구 정보 (SEO 최적화된 상세 정보 포함)
const tools: ToolInfo[] = [
  {
    id: 'json',
    path: '/json',
    title: 'JSON Viewer',
    description: 'Pretty print and traverse JSON',
    seoDescription:
      'Free online JSON viewer, formatter, and validator. Pretty print JSON with syntax highlighting, tree view, search, and copy features.',
    keywords: [
      'json viewer',
      'json formatter',
      'json prettifier',
      'json validator',
      'json parser',
      'json tree',
      'json beautifier',
      'online json tool',
    ],
    features: [
      'Pretty print JSON',
      'Tree view navigation',
      'Search and highlight',
      'Minify JSON',
      'Sort keys',
      'Copy formatted JSON',
    ],
  },
  {
    id: 'url',
    path: '/url',
    title: 'URL Encoder',
    description: 'Encode/Decode URL strings',
    seoDescription:
      'Free URL encoder and decoder tool. Encode special characters in URLs, decode URL-encoded strings, and handle query parameters safely.',
    keywords: [
      'url encoder',
      'url decoder',
      'url encode',
      'url decode',
      'percent encoding',
      'url encoding tool',
      'query string encoder',
    ],
    features: [
      'URL encoding',
      'URL decoding',
      'Query parameter encoding',
      'Plus sign for spaces option',
      'Real-time conversion',
    ],
  },
  {
    id: 'base64',
    path: '/base64',
    title: 'Base64',
    description: 'Base64 Encode/Decode',
    seoDescription:
      'Free Base64 encoder and decoder. Convert text to Base64 and vice versa. Supports UTF-8 encoding and URL-safe Base64. All processing happens in your browser.',
    keywords: [
      'base64 encoder',
      'base64 decoder',
      'base64 encode',
      'base64 decode',
      'base64url',
      'base64 converter',
      'text to base64',
    ],
    features: [
      'Base64 encoding',
      'Base64 decoding',
      'URL-safe Base64',
      'UTF-8 support',
      'Unicode handling',
      'Input/output swap',
    ],
  },
  {
    id: 'time',
    path: '/time',
    title: 'Time Converter',
    description: 'Epoch <-> ISO converter',
    seoDescription:
      'Free epoch timestamp converter. Convert Unix timestamps to human-readable dates and vice versa. Supports milliseconds, seconds, local time, and UTC.',
    keywords: [
      'epoch converter',
      'unix timestamp',
      'timestamp converter',
      'epoch to date',
      'date to epoch',
      'unix time converter',
      'iso 8601 converter',
    ],
    features: [
      'Epoch to ISO conversion',
      'ISO to epoch conversion',
      'Milliseconds and seconds support',
      'Local and UTC timezone',
      'Current time button',
    ],
  },
  {
    id: 'yaml',
    path: '/yaml',
    title: 'YAML Converter',
    description: 'YAML <-> JSON converter',
    seoDescription:
      'Free YAML to JSON converter and vice versa. Convert between YAML and JSON formats instantly. Includes error detection with line numbers.',
    keywords: [
      'yaml to json',
      'json to yaml',
      'yaml converter',
      'yaml parser',
      'yaml formatter',
      'yaml json converter',
      'yaml validator',
    ],
    features: [
      'YAML to JSON conversion',
      'JSON to YAML conversion',
      'Bidirectional conversion',
      'Error detection with line numbers',
      'Customizable indentation',
    ],
  },
  {
    id: 'diff',
    path: '/diff',
    title: 'Text Diff',
    description: 'Compare two texts',
    seoDescription:
      'Free text diff tool. Compare two text blocks side-by-side or in unified view. Highlight differences, ignore whitespace or case. Perfect for code reviews.',
    keywords: [
      'text diff',
      'diff tool',
      'text compare',
      'diff checker',
      'text difference',
      'unified diff',
      'side by side diff',
    ],
    features: [
      'Side-by-side comparison',
      'Unified diff view',
      'Ignore whitespace option',
      'Ignore case option',
      'Character-level diff statistics',
      'Export unified diff',
    ],
  },
  {
    id: 'cron',
    path: '/cron',
    title: 'Cron Parser',
    description: 'Cron expression explainer',
    seoDescription:
      'Free cron expression parser and validator. Understand cron expressions with human-readable descriptions. View next execution times and validate cron syntax.',
    keywords: [
      'cron parser',
      'cron expression',
      'cron validator',
      'cron generator',
      'cron schedule',
      'cron explainer',
      'cron calculator',
    ],
    features: [
      'Cron expression parsing',
      'Human-readable descriptions',
      'Next execution times',
      '5-field and 6-field support',
      'Timezone support',
      'Syntax validation',
    ],
  },
  {
    id: 'jwt-decoder',
    path: '/jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode JSON Web Tokens',
    seoDescription:
      'Free online JWT decoder. Decode JSON Web Tokens to view header, payload, and signature. Verify token signatures and check expiration. All processing happens in your browser.',
    keywords: [
      'jwt decoder',
      'jwt parser',
      'jwt token',
      'json web token',
      'jwt decode',
      'jwt validator',
      'jwt signature verification',
      'jwt viewer',
      'decode jwt',
    ],
    features: [
      'Decode JWT tokens',
      'Signature verification',
      'Token expiration check',
      'Header and payload viewer',
      'Token validation',
    ],
  },
  {
    id: 'jwt-encoder',
    path: '/jwt-encoder',
    title: 'JWT Encoder',
    description: 'Encode JSON Web Tokens',
    seoDescription:
      'Free online JWT encoder. Encode JSON Web Tokens from header and payload with HMAC signing. Generate secure JWT tokens. All processing happens in your browser.',
    keywords: [
      'jwt encoder',
      'jwt token',
      'json web token',
      'jwt encode',
      'jwt generator',
      'jwt signing',
      'hmac jwt',
      'encode jwt',
      'create jwt',
    ],
    features: [
      'Encode JWT tokens',
      'HMAC signing support',
      'Custom header and payload',
      'Multiple algorithm support',
      'Secure token generation',
    ],
  },
  {
    id: 'hash',
    path: '/hash',
    title: 'Hash/Checksum Generator',
    description: 'Calculate hash values and HMAC signatures',
    seoDescription:
      'Free online hash and checksum generator. Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes and HMAC signatures for text or files. Supports hex, Base64, and Base64URL encoding. All processing happens in your browser - no data sent to servers.',
    keywords: [
      'hash generator',
      'checksum calculator',
      'md5',
      'sha1',
      'sha256',
      'sha512',
      'hmac',
      'file hash',
      'cryptographic hash',
      'digest calculator',
      'hash tool',
      'checksum tool',
      'fingerprint generator',
      'hmac generator',
      'hmac calculator',
      'md5 calculator',
      'sha1 calculator',
    ],
    features: [
      'MD5, SHA-1, SHA-256, and SHA-512 hash calculation',
      'Text and file input support',
      'HMAC signature generation for all algorithms',
      'HMAC key encoding options (raw, hex, base64)',
      'Random key generation',
      'HMAC verification',
      'Hex, Base64, and Base64URL output formats',
      'Real-time calculation',
    ],
  },
  {
    id: 'uuid',
    path: '/uuid',
    title: 'UUID Generator',
    description: 'Generate UUID v4, UUID v7, and ULID identifiers',
    seoDescription:
      'Free online UUID and ULID generator. Generate UUID v4 (random), UUID v7 (timestamp-based), and ULID identifiers. Batch generation up to 100 IDs. All processing happens in your browser.',
    keywords: [
      'uuid generator',
      'ulid generator',
      'uuid v4',
      'uuid v7',
      'ulid',
      'unique identifier',
      'guid generator',
      'random id',
      'timestamp id',
      'uuid tool',
      'ulid tool',
    ],
    features: [
      'UUID v4 generation (random)',
      'UUID v7 generation (timestamp-based)',
      'ULID generation (shorter timestamp-based)',
      'Batch generation (up to 100 IDs)',
      'Lowercase and uppercase formats',
      'Copy individual or all IDs',
    ],
  },
  {
    id: 'password',
    path: '/password',
    title: 'Password Generator',
    description: 'Generate secure passwords with customizable options',
    seoDescription:
      'Free online password generator. Create strong, secure passwords with customizable length, character types, and exclusion options. Password strength indicator included. All processing happens in your browser.',
    keywords: [
      'password generator',
      'secure password',
      'random password',
      'password creator',
      'strong password',
      'password maker',
      'password tool',
      'password strength',
      'password checker',
      'online password generator',
      'password builder',
    ],
    features: [
      'Customizable password length (4-128 characters)',
      'Character type selection (uppercase, lowercase, numbers, symbols)',
      'Exclude similar characters (i, l, 1, L, o, 0, O)',
      'Exclude ambiguous symbols',
      'Password strength indicator (entropy-based)',
      'Batch generation (up to 20 passwords)',
      'Copy individual or all passwords',
    ],
  },
  {
    id: 'url-parser',
    path: '/url-parser',
    title: 'URL Parser',
    description:
      'Parse and visualize URL components including protocol, host, path, fragment, and query parameters',
    seoDescription:
      'Free online URL parser. Parse and visualize URL components (protocol, host, path, fragment, query parameters) with decoding options. Client-side processing.',
    keywords: [
      'url parser',
      'url analyzer',
      'url decoder',
      'url components',
      'query string parser',
      'query params',
      'url parameters',
      'url query parser',
      'query string analyzer',
      'url query string',
      'query parameter parser',
      'url query decoder',
    ],
    features: [
      'Parse URL components (protocol, host, path, fragment)',
      'Parse and visualize query parameters',
      'Show decoded and raw values',
      'Copy individual URL components',
      'Copy individual parameters',
      'Copy entire query string',
      'Real-time parsing',
    ],
  },
  {
    id: 'regex',
    path: '/regex',
    title: 'Regex Tester',
    description: 'Test and visualize regular expressions',
    seoDescription:
      'Free online regex tester and visualizer. Test regular expressions with real-time match highlighting, capture groups, named groups, and replacement preview. Supports all JavaScript RegExp flags. All processing happens in your browser.',
    keywords: [
      'regex tester',
      'regular expression tester',
      'regex tester online',
      'regex debugger',
      'pattern matcher',
      'regex validator',
      'regex visualizer',
      'regex tool',
      'regexp tester',
      'pattern test',
      'regex checker',
      'regex builder',
    ],
    features: [
      'Real-time pattern matching',
      'Match highlighting and visualization',
      'Capture groups and named groups support',
      'Replacement preview with group references',
      'All JavaScript RegExp flags (g, i, m, s, u, y, d, v)',
      'Match list with click-to-scroll',
      'Performance protection (debounce, backtracking warnings)',
    ],
  },
];

export function generateRoutes(): Plugin {
  return {
    name: 'generate-routes',
    closeBundle() {
      // 빌드 출력 디렉토리 찾기
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexHtmlPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(indexHtmlPath)) {
        console.warn('index.html not found, skipping route generation');
        return;
      }

      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

      // 각 도구별 HTML 생성 함수 (locale 지원)
      function generateToolHtml(
        tool: ToolInfo,
        baseHtml: string,
        locale: LocaleCode = DEFAULT_LOCALE
      ): string {
        // URL 경로 생성 (en-US는 prefix 없음, 다른 locale은 prefix 추가)
        const toolPath =
          locale === DEFAULT_LOCALE ? tool.path : `/${locale}${tool.path}`;
        const toolUrl = `https://tools.yowu.dev${toolPath}`;
        const keywordsStr = tool.keywords.join(', ');

        // 구조화된 데이터 (JSON-LD) 생성
        const structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${tool.title} | Yowu's DevTools`,
          url: toolUrl,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web',
          description: tool.seoDescription,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: tool.features,
          creator: {
            '@type': 'Person',
            name: 'yowu',
          },
          inLanguage: locale,
        };

        // SEO 최적화된 title 생성 (50-60자 권장)
        const seoTitle = `${tool.title} | Yowu's DevTools`;

        // Description이 160자를 초과하면 자르기 (110-160자 권장)
        const optimizedDescription =
          tool.seoDescription.length > 160
            ? tool.seoDescription.substring(0, 157) + '...'
            : tool.seoDescription;

        // HTML lang 속성용 locale 코드 (BCP 47)
        const htmlLang = locale.toLowerCase().replace('_', '-');

        // 메타 태그 생성
        const metaTags = `
    <title>${seoTitle}</title>
    <meta name="description" content="${optimizedDescription}" />
    <meta name="keywords" content="${keywordsStr}" />
    <link rel="canonical" href="${toolUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${toolUrl}" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${optimizedDescription}" />
    <meta property="og:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta property="og:image:alt" content="${tool.title} | Yowu's DevTools" />
    <meta property="og:site_name" content="Yowu's DevTools" />
    <meta property="og:locale" content="${htmlLang}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${optimizedDescription}" />
    <meta name="twitter:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta name="twitter:image:alt" content="${tool.title} | Yowu's DevTools" />
    <script type="application/ld+json">${JSON.stringify(
      structuredData,
      null,
      2
    )}</script>
  `;

        // 기존 head 태그에 메타 태그 추가
        let modifiedHtml = baseHtml.replace(
          /<head>([\s\S]*?)<\/head>/i,
          (_match, headContent) => {
            // 기존 title과 meta description, 구조화된 데이터 제거 (있는 경우)
            const cleanedHead = headContent
              .replace(/<title>.*?<\/title>/gi, '')
              .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
              .replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '')
              .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
              .replace(/<meta\s+property=["']og:[^>]*>/gi, '')
              .replace(/<meta\s+name=["']twitter:[^>]*>/gi, '')
              .replace(
                /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
                ''
              );

            // URL 정규화 스크립트 추가 (React Router가 올바른 경로를 인식하도록)
            // 즉시 실행되어야 하므로 head에 배치 (React Router 로드 전)
            const urlNormalizeScript = `
    <script>
      // /json/index.html -> /json으로 URL 변경 (React Router가 올바르게 작동하도록)
      // 즉시 실행하여 React Router가 로드되기 전에 URL을 정규화
      (function() {
        if (window.location.pathname.endsWith('/index.html')) {
          var newPath = window.location.pathname.replace(/\\/index\\.html$/, '');
          window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
        }
      })();
    </script>`;

            // 메타 태그와 URL 정규화 스크립트를 head 시작 부분에 삽입
            return `<head>${metaTags.trim()}${urlNormalizeScript}${cleanedHead}</head>`;
          }
        );

        // HTML lang 속성 추가/업데이트
        modifiedHtml = modifiedHtml.replace(
          /<html([^>]*)>/i,
          (_match, attrs) => {
            // 기존 lang 속성 제거
            const cleanedAttrs = attrs.replace(/\s+lang=["'][^"']*["']/gi, '');
            return `<html lang="${htmlLang}"${cleanedAttrs}>`;
          }
        );

        return modifiedHtml;
      }

      // 홈 페이지 HTML 생성 함수
      function generateHomeHtml(
        baseHtml: string,
        locale: LocaleCode = DEFAULT_LOCALE
      ): string {
        const homePath = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
        const homeUrl = `https://tools.yowu.dev${homePath}`;
        const htmlLang = locale.toLowerCase().replace('_', '-');

        const metaTags = `
    <title>Yowu's DevTools | Developer Tools</title>
    <meta name="description" content="A privacy-first toolbox for developers. JSON formatting, password generation, hash calculation, UUID creation, and more. All processing happens in your browser." />
    <link rel="canonical" href="${homeUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${homeUrl}" />
    <meta property="og:title" content="Yowu's DevTools | Developer Tools" />
    <meta property="og:description" content="A privacy-first toolbox for developers. All processing happens in your browser." />
    <meta property="og:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta property="og:locale" content="${htmlLang}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Yowu's DevTools | Developer Tools" />
    <meta name="twitter:description" content="A privacy-first toolbox for developers. All processing happens in your browser." />
    <meta name="twitter:image" content="https://tools.yowu.dev/opengraph.png" />
  `;

        let modifiedHtml = baseHtml.replace(
          /<head>([\s\S]*?)<\/head>/i,
          (_match, headContent) => {
            const cleanedHead = headContent
              .replace(/<title>.*?<\/title>/gi, '')
              .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
              .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
              .replace(/<meta\s+property=["']og:[^>]*>/gi, '')
              .replace(/<meta\s+name=["']twitter:[^>]*>/gi, '');
            return `<head>${metaTags.trim()}${cleanedHead}</head>`;
          }
        );

        // HTML lang 속성 추가/업데이트
        modifiedHtml = modifiedHtml.replace(
          /<html([^>]*)>/i,
          (_match, attrs) => {
            const cleanedAttrs = attrs.replace(/\s+lang=["'][^"']*["']/gi, '');
            return `<html lang="${htmlLang}"${cleanedAttrs}>`;
          }
        );

        return modifiedHtml;
      }

      // 각 locale과 tool 조합에 대해 HTML 파일 생성
      SUPPORTED_LOCALES.forEach((localeInfo) => {
        const locale = localeInfo.code;

        // 홈 페이지 생성
        if (locale === DEFAULT_LOCALE) {
          // en-US는 루트에 생성 (기존 호환성)
          const homeHtml = generateHomeHtml(indexHtml, locale);
          fs.writeFileSync(path.join(distDir, 'index.html'), homeHtml, 'utf-8');
          console.log(`✅ Generated: /index.html (${locale})`);
        } else {
          // 다른 locale은 /{locale}/index.html 생성
          const localeDir = path.join(distDir, locale);
          if (!fs.existsSync(localeDir)) {
            fs.mkdirSync(localeDir, { recursive: true });
          }
          const homeHtml = generateHomeHtml(indexHtml, locale);
          fs.writeFileSync(
            path.join(localeDir, 'index.html'),
            homeHtml,
            'utf-8'
          );
          console.log(`✅ Generated: /${locale}/index.html`);
        }

        // 각 도구에 대해 HTML 생성
        tools.forEach((tool) => {
          let toolDir: string;
          let toolPath: string;

          if (locale === DEFAULT_LOCALE) {
            // en-US는 기존 경로 유지 (하위 호환성)
            toolDir = path.join(distDir, tool.path.slice(1)); // '/json' -> 'json'
            toolPath = tool.path;
          } else {
            // 다른 locale은 /{locale}/{tool} 경로
            toolDir = path.join(distDir, locale, tool.path.slice(1));
            toolPath = `/${locale}${tool.path}`;
          }

          // 디렉토리 생성
          if (!fs.existsSync(toolDir)) {
            fs.mkdirSync(toolDir, { recursive: true });
          }

          // HTML 파일 생성
          const toolHtml = generateToolHtml(tool, indexHtml, locale);
          const toolHtmlPath = path.join(toolDir, 'index.html');
          fs.writeFileSync(toolHtmlPath, toolHtml, 'utf-8');

          console.log(`✅ Generated: ${toolPath}/index.html`);
        });
      });

      // 404.html 생성 (SPA 라우팅 지원)
      // GitHub Pages는 404 오류 시 이 파일을 반환합니다.
      //
      // 문제: .nojekyll 파일이 있으면 GitHub Pages가 디렉토리 인덱싱을 하지 않아
      // /json 요청 시 /json/index.html을 자동으로 찾지 못합니다.
      //
      // 해결: 각 경로에 대해 별도의 index.html 파일을 생성했지만,
      // GitHub Pages가 이를 찾지 못하므로 404.html에서 명시적으로 리다이렉트합니다.
      //
      // SEO를 위해 각 경로의 HTML 파일은 유지하되,
      // 404.html에서는 알려진 경로를 해당 경로의 index.html로 리다이렉트합니다.
      // 알려진 경로 목록 (모든 locale 포함)
      const knownPaths = [
        '/',
        ...SUPPORTED_LOCALES.map((loc) =>
          loc.code === DEFAULT_LOCALE ? '/' : `/${loc.code}`
        ),
        ...tools.map((tool) => tool.path),
        ...SUPPORTED_LOCALES.flatMap((loc) =>
          loc.code === DEFAULT_LOCALE
            ? []
            : tools.map((tool) => `/${loc.code}${tool.path}`)
        ),
      ];

      const redirectScript = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    (function() {
      // GitHub Pages 404.html 리다이렉트
      // 알려진 경로 목록 (모든 locale 포함)
      var knownPaths = ${JSON.stringify(knownPaths)};
      
      var path = window.location.pathname;
      var search = window.location.search;
      var hash = window.location.hash;
      
      // /index.html로 끝나는 경우는 이미 리다이렉트된 것으로 간주
      // 하지만 404.html이 실행되었다는 것은 파일을 찾지 못했다는 의미
      // 이 경우 루트 index.html로 리다이렉트하고 React Router가 처리하도록 함
      if (path.endsWith('/index.html')) {
        // /json/index.html -> /index.html로 리다이렉트 (React Router가 /json 경로 처리)
        window.location.replace('/index.html' + search + hash);
        return;
      }
      
      // 알려진 경로인지 확인
      var isKnownPath = knownPaths.includes(path);
      
      if (isKnownPath && path !== '/') {
        // 알려진 경로인 경우 (루트 제외)
        // 해당 경로의 index.html 파일이 존재하므로 리다이렉트
        // 예: /json -> /json/index.html
        // 
        // 참고: .nojekyll 파일이 있으면 GitHub Pages가 자동으로 찾지 못하므로
        // 명시적으로 리다이렉트해야 합니다.
        window.location.replace(path + '/index.html' + search + hash);
      } else {
        // 루트 경로이거나 알려진 경로가 아닌 경우
        // 루트 index.html로 리다이렉트 (React Router가 처리)
        window.location.replace('/index.html' + search + hash);
      }
    })();
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;

      fs.writeFileSync(path.join(distDir, '404.html'), redirectScript, 'utf-8');
      console.log('✅ Generated: 404.html');

      // sitemap.xml 생성 (모든 locale 포함)
      const sitemapUrls: string[] = [];
      const lastmod = new Date().toISOString().split('T')[0];

      // 홈 페이지 (모든 locale)
      SUPPORTED_LOCALES.forEach((localeInfo) => {
        const locale = localeInfo.code;
        const homePath = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
        sitemapUrls.push(`  <url>
    <loc>https://tools.yowu.dev${homePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);
      });

      // 각 도구 (모든 locale)
      SUPPORTED_LOCALES.forEach((localeInfo) => {
        const locale = localeInfo.code;
        tools.forEach((tool) => {
          const toolPath =
            locale === DEFAULT_LOCALE ? tool.path : `/${locale}${tool.path}`;
          sitemapUrls.push(`  <url>
    <loc>https://tools.yowu.dev${toolPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
        });
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join('\n')}
</urlset>`;

      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8');
      console.log('✅ Generated: sitemap.xml');

      // robots.txt 생성
      const robots = `User-agent: *
Allow: /

Sitemap: https://tools.yowu.dev/sitemap.xml`;

      fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf-8');
      console.log('✅ Generated: robots.txt');

      // .nojekyll 파일 생성 (Jekyll 비활성화)
      fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf-8');
      console.log('✅ Generated: .nojekyll');

      // CNAME 파일 생성 (커스텀 도메인용)
      const cname = 'tools.yowu.dev';
      fs.writeFileSync(path.join(distDir, 'CNAME'), cname, 'utf-8');
      console.log(`✅ Generated: CNAME (${cname})`);

      // version.json 생성 (PWA 업데이트 감지용)
      const versionInfo = {
        version: appVersion,
        buildTime: new Date().toISOString(),
      };
      fs.writeFileSync(
        path.join(distDir, 'version.json'),
        JSON.stringify(versionInfo, null, 2),
        'utf-8'
      );
      console.log(`✅ Generated: version.json (v${appVersion})`);

      console.log(
        '\n🎉 All route HTML files and SEO files generated successfully!'
      );
    },
  };
}
