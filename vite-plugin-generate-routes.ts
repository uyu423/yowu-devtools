import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

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

      // 각 도구별 HTML 생성 함수
      function generateToolHtml(tool: ToolInfo, baseHtml: string): string {
        const toolUrl = `https://tools.yowu.dev${tool.path}`;
        const keywordsStr = tool.keywords.join(', ');

        // 구조화된 데이터 (JSON-LD) 생성
        const structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${tool.title} - tools.yowu.dev`,
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
        };

        // SEO 최적화된 title 생성 (50-60자 권장)
        const seoTitle = `${tool.title} - Dev Tool | tools.yowu.dev`;

        // Description이 160자를 초과하면 자르기 (110-160자 권장)
        const optimizedDescription =
          tool.seoDescription.length > 160
            ? tool.seoDescription.substring(0, 157) + '...'
            : tool.seoDescription;

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
    <meta property="og:image:alt" content="${tool.title} - Dev Tool" />
    <meta property="og:site_name" content="tools.yowu.dev" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${optimizedDescription}" />
    <meta name="twitter:image" content="https://tools.yowu.dev/opengraph.png" />
    <meta name="twitter:image:alt" content="${tool.title} - Dev Tool" />
    <script type="application/ld+json">${JSON.stringify(
      structuredData,
      null,
      2
    )}</script>
  `;

        // 기존 head 태그에 메타 태그 추가
        const modifiedHtml = baseHtml.replace(
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

            // 메타 태그를 head 시작 부분에 삽입
            return `<head>${metaTags.trim()}${cleanedHead}</head>`;
          }
        );

        return modifiedHtml;
      }

      // 각 도구 경로에 대해 디렉토리 생성 및 HTML 파일 복사
      tools.forEach((tool) => {
        const toolDir = path.join(distDir, tool.path.slice(1)); // '/json' -> 'json'

        // 디렉토리 생성
        if (!fs.existsSync(toolDir)) {
          fs.mkdirSync(toolDir, { recursive: true });
        }

        // HTML 파일 생성
        const toolHtml = generateToolHtml(tool, indexHtml);
        const toolHtmlPath = path.join(toolDir, 'index.html');
        fs.writeFileSync(toolHtmlPath, toolHtml, 'utf-8');

        console.log(`✅ Generated: ${tool.path}/index.html`);
      });

      // 404.html 생성 (SPA 라우팅 지원)
      const redirectScript = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // GitHub Pages 404.html 리다이렉트
    var path = window.location.pathname;
    var search = window.location.search;
    var hash = window.location.hash;
    var url = path.split('/').pop();
    
    if (url && url !== '404.html') {
      // 라우트가 존재하는 경우 해당 경로로 리다이렉트
      window.location.replace(path + search + hash);
    } else {
      // 루트로 리다이렉트
      window.location.replace('/' + search + hash);
    }
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;

      fs.writeFileSync(path.join(distDir, '404.html'), redirectScript, 'utf-8');
      console.log('✅ Generated: 404.html');

      // sitemap.xml 생성
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tools.yowu.dev/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${tools
  .map(
    (tool) => `  <url>
    <loc>https://tools.yowu.dev${tool.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
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

      console.log(
        '\n🎉 All route HTML files and SEO files generated successfully!'
      );
    },
  };
}
