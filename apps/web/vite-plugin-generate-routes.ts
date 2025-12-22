import type { Plugin } from 'vite';
// i18n 리소스 임포트 (빌드 시점에 사용)
import { enUS } from './src/i18n/en-US';
import { esES } from './src/i18n/es-ES';
import fs from 'fs';
import { jaJP } from './src/i18n/ja-JP';
import { koKR } from './src/i18n/ko-KR';
import path from 'path';
import { zhCN } from './src/i18n/zh-CN';

// Locale 타입 및 상수 정의 (src/lib/constants.ts와 동기화 필요)
// Node.js 환경에서 직접 사용하기 위해 별도 정의
type LocaleCode = 'en-US' | 'ko-KR' | 'ja-JP' | 'zh-CN' | 'es-ES';

interface LocaleInfo {
  code: LocaleCode;
  name: string;
  nativeName: string;
}

const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
];

const DEFAULT_LOCALE: LocaleCode = 'en-US';

// i18n 메타 정보 타입 (SEO용)
interface I18nMetaInfo {
  title: string;
  description: string;
}

interface I18nMetaSection {
  home: I18nMetaInfo;
  [key: string]: I18nMetaInfo | Record<string, unknown>;
}

interface I18nResource {
  meta: I18nMetaSection;
}

// Locale별 i18n 리소스 매핑
const i18nResources: Record<LocaleCode, I18nResource> = {
  'en-US': enUS as unknown as I18nResource,
  'ko-KR': koKR as unknown as I18nResource,
  'ja-JP': jaJP as unknown as I18nResource,
  'zh-CN': zhCN as unknown as I18nResource,
  'es-ES': esES as unknown as I18nResource,
};

// Tool ID -> i18n meta key 매핑 (ID와 key가 다른 경우만)
const toolIdToI18nKey: Record<string, string> = {
  'url-parser': 'urlParser',
  'jwt-decoder': 'jwtDecoder',
  'jwt-encoder': 'jwtEncoder',
  'string-length': 'stringLength',
  'curl-parser': 'curl',
  'api-tester': 'apiTester',
  'api-diff': 'apiDiff',
  'image-studio': 'imageStudio',
  'video-studio': 'videoStudio',
  'api-burst-test': 'apiBurstTest',
};

// Tool ID에서 i18n meta key 가져오기
function getI18nMetaKey(toolId: string): string {
  return toolIdToI18nKey[toolId] || toolId;
}

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

// Sitemap Priority 설정
// 개발자들은 "json formatter", "base64 decode" 등으로 직접 검색하므로
// 개별 도구 페이지가 홈페이지보다 priority가 높아야 함
const TOOL_PRIORITY = 1.0; // 모든 개별 도구 (en-US)
const TOOL_LOCALE_PRIORITY = 0.9; // Locale 버전 도구 페이지
const HOME_PRIORITY = 0.8; // 메인 페이지 (홈)

// 도구 정보 (SEO 최적화된 상세 정보 포함)
const tools: ToolInfo[] = [
  {
    id: 'json',
    path: '/json',
    title: 'JSON Viewer',
    description: 'Instantly format JSON and browse in a tree structure',
    seoDescription:
      'Free online JSON viewer, formatter, and validator. Format JSON with syntax highlighting, collapsible tree view, search, and one-click copy.',
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
    description: 'Percent-encode or decode URL strings in real time',
    seoDescription:
      'Free online URL encoder and decoder. Percent-encode special characters or decode URLs with full Unicode and UTF-8 support.',
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
    title: 'Base64 Converter',
    description: 'Encode text to Base64 or decode Base64 back to text',
    seoDescription:
      'Free online Base64 encoder and decoder. Encode text to Base64 or decode Base64 strings with UTF-8 and URL-safe variant support.',
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
    description: 'Convert epoch timestamps to ISO dates and vice versa',
    seoDescription:
      'Free online epoch timestamp converter. Convert Unix timestamps (seconds/milliseconds) to ISO 8601 dates and vice versa with timezone support.',
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
    description: 'Convert between YAML and JSON formats bidirectionally',
    seoDescription:
      'Free online YAML-JSON converter. Convert between YAML and JSON formats bidirectionally with syntax validation and error reporting.',
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
    description: 'Compare two texts with line and character-level highlighting',
    seoDescription:
      'Free online text diff tool. Compare two text blocks side-by-side or in unified view with line-by-line and character-level highlighting.',
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
    description: 'Explain cron expressions with next run times',
    seoDescription:
      'Free online cron expression parser. Explain cron schedules in plain English and preview next execution times with multiple dialect support.',
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
    description: 'Decode JWTs and inspect header, payload, and signature',
    seoDescription:
      'Free online JWT decoder. Decode JSON Web Tokens to inspect header, payload, expiration, and optionally verify HMAC/RSA signatures.',
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
    description: 'Create signed JWTs from header and payload',
    seoDescription:
      'Free online JWT encoder. Create signed JSON Web Tokens with custom header, payload, and HS256/HS384/HS512 HMAC algorithms.',
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
    title: 'Hash Generator',
    description:
      'Generate MD5, SHA-1, SHA-256, SHA-512 hashes and HMAC signatures',
    seoDescription:
      'Free online hash generator. Calculate MD5, SHA-1, SHA-256, SHA-512 hashes for text or files, plus HMAC signatures with key support.',
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
      'Free online UUID and ULID generator. Generate cryptographically random UUID v4, timestamp-based UUID v7, and sortable ULID identifiers.',
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
    description: 'Generate strong passwords with character and length options',
    seoDescription:
      'Free online password generator. Create cryptographically secure passwords with custom length, character types, and exclusion rules.',
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
      'Break URLs into protocol, host, path, query, and fragment components',
    seoDescription:
      'Free online URL parser. Break down URLs into protocol, host, path, query parameters, and fragment with decoded value display.',
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
    description:
      'Test regex patterns live with match and capture-group highlighting',
    seoDescription:
      'Free online regular expression tester. Test regex patterns with live match highlighting, capture groups, and replacement preview.',
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
  {
    id: 'string-length',
    path: '/string-length',
    title: 'String Length Calculator',
    description: 'Count characters, words, lines, and bytes in text',
    seoDescription:
      'Free online string length counter. Count characters, words, lines, and UTF-8 bytes in your text with file upload support.',
    keywords: [
      'string length',
      'character count',
      'word count',
      'line count',
      'byte count',
      'text counter',
      'string counter',
      'character counter',
      'utf8 bytes',
      'text analyzer',
      'text statistics',
    ],
    features: [
      'Character count (with and without spaces)',
      'Word count',
      'Line count',
      'Byte count (UTF-8)',
      'File upload support',
      'Real-time calculation',
      'Unicode support',
    ],
  },
  {
    id: 'api-tester',
    path: '/api-tester',
    title: 'API Tester',
    description: 'Build HTTP requests and bypass CORS via browser extension',
    seoDescription:
      'Free online API tester. Build HTTP requests with all methods, headers, body types, and bypass CORS restrictions via browser extension.',
    keywords: [
      'api tester',
      'http client',
      'rest api tester',
      'api test tool',
      'postman alternative',
      'http request builder',
      'api debugger',
      'cors bypass',
      'api testing',
      'rest client',
      'http tester',
      'api request tool',
    ],
    features: [
      'All HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)',
      'Custom headers with key-value editor',
      'Body types: JSON, text, form-urlencoded, multipart',
      'CORS bypass via Chrome extension',
      'Response viewer with JSON tree, pretty print, and raw views',
      'Request history and favorites',
      'cURL command export',
    ],
  },
  {
    id: 'curl-parser',
    path: '/curl',
    title: 'cURL Parser',
    description: 'Parse cURL commands into method, URL, headers, and body',
    seoDescription:
      'Free online cURL command parser. Parse cURL into method, URL, headers, cookies, and body components with one-click API Tester import.',
    keywords: [
      'curl parser',
      'curl command parser',
      'curl visualizer',
      'parse curl',
      'curl to api',
      'curl converter',
      'curl command analyzer',
      'http request parser',
      'curl command viewer',
    ],
    features: [
      'Parse cURL commands',
      'Extract URL, method, headers, cookies',
      'Parse request body (JSON, form-data, urlencoded)',
      'Visualize cURL options',
      'Open in API Tester',
      'Sensitive data masking',
      'Cookie string parsing',
    ],
  },
  {
    id: 'api-diff',
    path: '/api-diff',
    title: 'API Response Diff',
    description: 'Call two endpoints simultaneously and compare JSON responses',
    seoDescription:
      'Free online API response comparison tool. Call two endpoints simultaneously and highlight JSON response differences side-by-side.',
    keywords: [
      'api diff',
      'api comparison',
      'json diff',
      'api response compare',
      'response comparison',
      'api testing',
      'json comparison tool',
      'api differ',
      'endpoint comparison',
      'api response diff',
    ],
    features: [
      'Compare responses from two domains',
      'Side-by-side diff view',
      'JSON response comparison',
      'Status code comparison',
      'Diff highlighting (yellow for different, red for missing)',
      'cURL command generation',
      'Request history',
      'CORS bypass via extension',
    ],
  },
  {
    id: 'image-studio',
    path: '/image-studio',
    title: 'Image Studio',
    description: 'Crop, resize, rotate, and convert images in your browser',
    seoDescription:
      'Free online image editor. Crop, resize, rotate, and convert images to PNG, JPEG, or WebP. All processing happens in your browser - no uploads.',
    keywords: [
      'image editor',
      'image resizer',
      'image cropper',
      'image converter',
      'image compressor',
      'online image editor',
      'png to jpeg',
      'webp converter',
      'photo editor',
      'image optimizer',
      'resize image',
      'crop image',
    ],
    features: [
      'Crop with aspect ratio presets',
      'Resize with quality settings',
      'Rotate and flip images',
      'Convert to PNG, JPEG, or WebP',
      'Adjustable export quality',
      'Pipeline-based workflow',
      'Client-side processing',
    ],
  },
  {
    id: 'video-studio',
    path: '/video-studio',
    title: 'Video Studio',
    description: 'Trim, cut, crop, resize, and convert videos in your browser',
    seoDescription:
      'Free online video editor. Trim, cut, crop, resize, and convert videos to MP4 or WebM. Extract thumbnails. All processing in your browser - no uploads.',
    keywords: [
      'video editor',
      'video trimmer',
      'video cutter',
      'video cropper',
      'video resizer',
      'video converter',
      'online video editor',
      'mp4 converter',
      'webm converter',
      'video compressor',
      'extract thumbnail',
      'ffmpeg wasm',
    ],
    features: [
      'Trim video start and end',
      'Cut or split into clips',
      'Crop video frame',
      'Resize with presets',
      'Extract thumbnail at any time',
      'Convert to MP4 or WebM',
      'Pipeline-based workflow',
      'Browser-based processing',
    ],
  },
  {
    id: 'api-burst-test',
    path: '/api-burst-test',
    title: 'API Burst Test',
    description: 'HTTP load testing with latency distribution and RPS metrics',
    seoDescription:
      'Free online HTTP load testing tool. Measure API performance with latency percentiles (p50/p95/p99), requests per second, status code distribution. Browser-based burst testing.',
    keywords: [
      'api load test',
      'http load test',
      'api performance test',
      'api benchmark',
      'http benchmark',
      'latency test',
      'rps test',
      'stress test',
      'burst test',
      'hey alternative',
      'ab alternative',
      'load testing tool',
    ],
    features: [
      'Configurable concurrency and request count',
      'Duration-based or request-count-based testing',
      'Latency percentile distribution (p50/p90/p95/p99)',
      'Status code breakdown',
      'Error analysis and categorization',
      'Export results as JSON/CSV',
      'Rate limiting support',
      'Browser-based execution',
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

        // i18n 리소스에서 locale별 SEO 정보 가져오기
        const i18n = i18nResources[locale];
        const i18nMetaKey = getI18nMetaKey(tool.id);
        const toolMeta = i18n.meta[i18nMetaKey] as I18nMetaInfo | undefined;

        // locale별 타이틀과 설명 (fallback: 영어)
        const localizedTitle = toolMeta?.title || tool.title;
        const localizedDescription =
          toolMeta?.description || tool.seoDescription;

        // 구조화된 데이터 (JSON-LD) 생성
        const structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${localizedTitle} | Yowu's DevTools`,
          url: toolUrl,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web',
          description: localizedDescription,
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

        // Breadcrumb 구조화된 데이터 생성
        const breadcrumbData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://tools.yowu.dev/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: localizedTitle,
              item: toolUrl,
            },
          ],
        };

        // SEO 최적화된 title 생성 (50-60자 권장)
        const seoTitle = `${localizedTitle} | Yowu's DevTools`;

        // Description이 160자를 초과하면 자르기 (110-160자 권장)
        const optimizedDescription =
          localizedDescription.length > 160
            ? localizedDescription.substring(0, 157) + '...'
            : localizedDescription;

        // HTML lang 속성용 locale 코드 (BCP 47: en-US, ko-KR, ja-JP 등)
        const htmlLang = locale;

        // hreflang 링크 생성 (다국어 페이지 관계 명시)
        const hreflangLinks = SUPPORTED_LOCALES.map((loc) => {
          const hrefLang =
            loc.code === DEFAULT_LOCALE ? 'en' : loc.code.split('-')[0].toLowerCase();
          const hrefUrl =
            loc.code === DEFAULT_LOCALE ? tool.path : `/${loc.code}${tool.path}`;
          return `<link rel="alternate" hreflang="${hrefLang}" href="https://tools.yowu.dev${hrefUrl}" />`;
        }).join('\n    ');

        // 메타 태그 생성
        const metaTags = `
    <title>${seoTitle}</title>
    <meta name="description" content="${optimizedDescription}" />
    <meta name="keywords" content="${keywordsStr}" />
    <meta name="naver-site-verification" content="864d7acc0fcc19f0e3da6dc2422c36f1be1f4e95" />
    <link rel="canonical" href="${toolUrl}" />
    ${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="https://tools.yowu.dev${tool.path}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${toolUrl}" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${optimizedDescription}" />
    <meta property="og:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta property="og:image:alt" content="${localizedTitle} | Yowu's DevTools" />
    <meta property="og:site_name" content="Yowu's DevTools" />
    <meta property="og:locale" content="${htmlLang}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${optimizedDescription}" />
    <meta name="twitter:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta name="twitter:image:alt" content="${localizedTitle} | Yowu's DevTools" />
    <script type="application/ld+json">${JSON.stringify(
      structuredData,
      null,
      2
    )}</script>
    <script type="application/ld+json">${JSON.stringify(
      breadcrumbData,
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
        // HTML lang 속성용 locale 코드 (BCP 47: en-US, ko-KR, ja-JP 등)
        const htmlLang = locale;

        // i18n 리소스에서 locale별 홈 SEO 정보 가져오기
        const i18n = i18nResources[locale];
        const homeMeta = i18n.meta.home as {
          title: string;
          description: string;
        };
        const homeTitle = `${homeMeta.title} | Developer Tools`;
        const homeDescription = homeMeta.description;

        // hreflang 링크 생성 (다국어 페이지 관계 명시)
        const hreflangLinks = SUPPORTED_LOCALES.map((loc) => {
          const hrefLang =
            loc.code === DEFAULT_LOCALE ? 'en' : loc.code.split('-')[0].toLowerCase();
          const hrefUrl = loc.code === DEFAULT_LOCALE ? '/' : `/${loc.code}`;
          return `<link rel="alternate" hreflang="${hrefLang}" href="https://tools.yowu.dev${hrefUrl}" />`;
        }).join('\n    ');

        const metaTags = `
    <title>${homeTitle}</title>
    <meta name="description" content="${homeDescription}" />
    <meta name="naver-site-verification" content="864d7acc0fcc19f0e3da6dc2422c36f1be1f4e95" />
    <link rel="canonical" href="${homeUrl}" />
    ${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="https://tools.yowu.dev/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${homeUrl}" />
    <meta property="og:title" content="${homeTitle}" />
    <meta property="og:description" content="${homeDescription}" />
    <meta property="og:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta property="og:locale" content="${htmlLang}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${homeTitle}" />
    <meta name="twitter:description" content="${homeDescription}" />
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

      // sitemap.xml 생성 (모든 locale 포함, hreflang 정보 포함)
      const sitemapUrls: string[] = [];
      const lastmod = new Date().toISOString().split('T')[0];

      // 홈 페이지 hreflang 링크 생성 (모든 언어 버전)
      const homeHreflangLinks = SUPPORTED_LOCALES.map((loc) => {
        const hrefLang =
          loc.code === DEFAULT_LOCALE ? 'en' : loc.code.split('-')[0].toLowerCase();
        const hrefUrl = loc.code === DEFAULT_LOCALE ? '/' : `/${loc.code}`;
        return `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="https://tools.yowu.dev${hrefUrl}"/>`;
      }).join('\n');

      // 홈 페이지 (모든 locale) - priority: 0.8
      SUPPORTED_LOCALES.forEach((localeInfo) => {
        const locale = localeInfo.code;
        const homePath = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
        sitemapUrls.push(`  <url>
    <loc>https://tools.yowu.dev${homePath}</loc>
${homeHreflangLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tools.yowu.dev/"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${HOME_PRIORITY.toFixed(1)}</priority>
  </url>`);
      });

      // 각 도구 (모든 locale)
      // 개발자들은 "json formatter", "base64 decode" 등으로 직접 검색하므로
      // 개별 도구 페이지가 홈페이지보다 priority가 높음
      tools.forEach((tool) => {
        // 각 도구별로 hreflang 링크 생성
        const toolHreflangLinks = SUPPORTED_LOCALES.map((loc) => {
          const hrefLang =
            loc.code === DEFAULT_LOCALE ? 'en' : loc.code.split('-')[0].toLowerCase();
          const hrefUrl =
            loc.code === DEFAULT_LOCALE ? tool.path : `/${loc.code}${tool.path}`;
          return `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="https://tools.yowu.dev${hrefUrl}"/>`;
        }).join('\n');

        SUPPORTED_LOCALES.forEach((localeInfo) => {
          const locale = localeInfo.code;
          const priority =
            locale === DEFAULT_LOCALE ? TOOL_PRIORITY : TOOL_LOCALE_PRIORITY;
          const toolPath =
            locale === DEFAULT_LOCALE ? tool.path : `/${locale}${tool.path}`;
          sitemapUrls.push(`  <url>
    <loc>https://tools.yowu.dev${toolPath}</loc>
${toolHreflangLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tools.yowu.dev${tool.path}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority.toFixed(1)}</priority>
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
