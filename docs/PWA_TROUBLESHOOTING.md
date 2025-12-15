# PWA 설치 및 업데이트 문제 해결 가이드

> 최종 업데이트: v1.3.3 (2025-12)

## 목차

1. [PWA 업데이트가 반영되지 않는 문제](#pwa-업데이트가-반영되지-않는-문제)
2. [Chrome에서 Web App 설치 아이콘이 표시되지 않는 경우](#chrome에서-web-app-설치-아이콘이-표시되지-않는-경우)
3. [vite-plugin-pwa 설정 가이드](#vite-plugin-pwa-설정-가이드)
4. [디버깅 명령어](#디버깅-명령어)

---

## PWA 업데이트가 반영되지 않는 문제

### 증상

- 새로운 GitHub Pages 배포 후에도 앱이 업데이트되지 않음
- 설치된 PWA에서 업데이트 알림이 표시되지 않음
- 새 기능이나 버그 수정이 반영되지 않음

### 원인 분석

#### 1. `registerType` 설정과 `skipWaiting`/`clientsClaim` 충돌

**문제**: `registerType: 'prompt'` 모드에서 `skipWaiting: true`와 `clientsClaim: true`를 함께 설정하면 안 됩니다.

- `prompt` 모드: 사용자에게 업데이트 알림을 표시하고, 사용자가 확인하면 업데이트
- `skipWaiting: true`: 새 Service Worker가 즉시 활성화됨
- 충돌: 새 SW가 즉시 활성화되면 프롬프트가 표시될 틈이 없음

**해결책** (v1.3.3에서 수정됨):

```typescript
// vite.config.ts
VitePWA({
  registerType: 'prompt', // 사용자에게 업데이트 알림 표시
  workbox: {
    // NOTE: prompt 모드에서는 skipWaiting과 clientsClaim을 설정하면 안됨
    // 이 옵션들은 autoUpdate 모드에서만 자동으로 활성화됨
    cleanupOutdatedCaches: true,
  },
});
```

#### 2. Service Worker 업데이트 감지 실패

**문제**: Service Worker가 새 버전을 감지하지 못하거나 업데이트 체크가 실패함

**해결책** (v1.3.3에서 개선됨):

1. **version.json 기반 버전 체크** (보조 메커니즘)
   - 빌드 시 `/version.json` 파일 자동 생성
   - 앱 기동 시 서버 버전과 비교
   - 5분마다 주기적으로 버전 체크
   - Service Worker와 독립적으로 동작

2. **Service Worker 업데이트 체크**
   - 앱이 포커스를 받을 때 업데이트 체크
   - 온라인 상태가 되면 즉시 업데이트 체크
   - 오프라인일 때는 업데이트 체크 스킵

```typescript
// usePWA.ts - 버전 체크 로직
const checkVersionUpdate = async () => {
  if (!navigator.onLine) return;

  const response = await fetch(`/version.json?t=${Date.now()}`, {
    cache: 'no-store',
  });
  const serverVersion = await response.json();

  if (serverVersion.version !== APP_VERSION) {
    setNeedRefresh(true); // 업데이트 알림 표시
  }
};
```

```typescript
// usePWA.ts - Service Worker 업데이트 체크
const updateSWFn = registerSW({
  immediate: true,
  onNeedRefresh() {
    setNeedRefresh(true);
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // 주기적 업데이트 체크 (1시간마다)
      setInterval(() => {
        if (navigator.onLine) {
          registration.update();
        }
      }, 60 * 60 * 1000);

      // 앱이 포커스를 받을 때 업데이트 체크
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      });
    }
  },
});
```

### 해결 단계

#### Step 1: 기존 캐시 및 Service Worker 초기화

1. Chrome DevTools → Application → Storage → "Clear site data" 클릭
2. Application → Service Workers → "Unregister" 클릭
3. 페이지 강제 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

#### Step 2: 최신 버전 확인

1. 페이지 새로고침 후 버전 확인 (Footer 또는 홈페이지)
2. Console에서 `[PWA]` 로그 확인

#### Step 3: 업데이트 프롬프트 확인

- 새 버전이 있으면 화면 하단에 "New version available" 프롬프트 표시
- "Update Now" 클릭하면 페이지 새로고침 후 새 버전 적용

---

## Chrome에서 Web App 설치 아이콘이 표시되지 않는 경우

### 1. Chrome DevTools에서 확인 사항

#### Application → Manifest

- ✅ Manifest가 올바르게 로드되는지 확인
- ✅ 모든 필수 필드가 있는지 확인
- ✅ 아이콘 경로가 올바른지 확인

#### Application → Service Workers

- ✅ Service Worker가 등록되어 있는지 확인
- ✅ 상태가 "activated"인지 확인
- ✅ 에러가 없는지 확인

#### Console

- ✅ Service Worker 등록 에러 확인
- ✅ Manifest 로드 에러 확인

### 2. Chrome PWA 설치 요구사항

다음 조건을 모두 만족해야 합니다:

1. ✅ **HTTPS 또는 localhost**: 프로덕션은 HTTPS, 개발은 localhost
2. ✅ **유효한 manifest.json**: 모든 필수 필드 포함
3. ✅ **Service Worker 등록**: 활성화된 Service Worker 필요
4. ✅ **아이콘**: 최소 192x192와 512x512 아이콘 필요
5. ✅ **start_url**: 유효한 경로
6. ✅ **display**: 'standalone', 'fullscreen', 또는 'minimal-ui'

### 3. 파일 위치 확인

#### manifest.json

- 빌드 후: `dist/manifest.json`
- 배포 후: `https://tools.yowu.dev/manifest.json`

#### Service Worker

- 빌드 후: `dist/sw.js`
- 배포 후: `https://tools.yowu.dev/sw.js`

#### 아이콘

- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)

### 4. 추가 확인 사항

#### 이미 설치된 경우

- Chrome이 이미 설치된 앱에 대해서는 설치 프롬프트를 표시하지 않습니다
- `chrome://apps`에서 확인

#### 이전에 "설치 안 함" 선택한 경우

- Chrome이 사용자의 선택을 기억합니다
- 캐시 및 쿠키 삭제 후 다시 시도

#### 개발 환경 (localhost)

- localhost에서는 설치 프롬프트가 표시되지 않을 수 있습니다
- 프로덕션 환경(HTTPS)에서 테스트 권장

---

## vite-plugin-pwa 설정 가이드

### registerType 옵션

| 옵션                | 설명                          | skipWaiting/clientsClaim       |
| ------------------- | ----------------------------- | ------------------------------ |
| `'prompt'` (기본값) | 사용자에게 업데이트 알림 표시 | **설정하면 안됨** (자동 false) |
| `'autoUpdate'`      | 자동으로 업데이트 (새로고침)  | **자동으로 true** 설정됨       |

### 현재 설정 (v1.3.3+)

```typescript
// vite.config.ts
VitePWA({
  registerType: 'prompt', // 사용자에게 업데이트 알림 표시
  includeAssets: [
    'favicon.svg',
    'opengraph.png',
    'icon-192.png',
    'icon-512.png',
  ],
  manifestFilename: 'manifest.json',
  manifest: {
    name: "Yowu's DevTools",
    short_name: 'DevTools',
    // ... 기타 설정
  },
  workbox: {
    runtimeCaching: [
      /* ... */
    ],
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: '/404.html',
    cleanupOutdatedCaches: true,
    // NOTE: prompt 모드에서는 skipWaiting과 clientsClaim 설정 안함
  },
});
```

### 참고 문서

- [vite-plugin-pwa 공식 문서](https://vite-pwa-org.netlify.app/)
- [Prompt for update 가이드](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html)
- [Periodic SW updates 가이드](https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html)
- [Service Worker Strategies](https://vite-pwa-org.netlify.app/guide/service-worker-strategies-and-behaviors.html)

---

## 디버깅 명령어

브라우저 Console에서 실행:

```javascript
// Service Worker 상태 확인
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log('Service Workers:', registrations);
  registrations.forEach((reg) => {
    console.log('Scope:', reg.scope);
    console.log('Active:', reg.active);
    console.log('Waiting:', reg.waiting);
    console.log('Installing:', reg.installing);
  });
});

// Manifest 확인
fetch('/manifest.json')
  .then((res) => res.json())
  .then((manifest) => console.log('Manifest:', manifest));

// 수동 업데이트 체크
navigator.serviceWorker.ready.then((registration) => {
  registration.update().then(() => {
    console.log('Update check completed');
  });
});

// 설치 가능 여부 확인
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available:', e);
});

// 현재 Service Worker 버전 확인
if (navigator.serviceWorker.controller) {
  console.log('Controller:', navigator.serviceWorker.controller.scriptURL);
}

// 서버 버전 확인 (version.json)
fetch('/version.json?t=' + Date.now())
  .then((res) => res.json())
  .then((v) => console.log('Server version:', v));
```

### Console 로그 의미

| 로그                                                         | 의미                                |
| ------------------------------------------------------------ | ----------------------------------- |
| `[PWA] Service Worker registered`                            | SW 등록 성공                        |
| `[PWA] New content available - refresh needed`               | 새 버전 발견, 업데이트 필요         |
| `[PWA] App ready to work offline`                            | 오프라인 모드 준비 완료             |
| `[PWA] App became visible - checking for updates`            | 앱 포커스 시 업데이트 체크          |
| `[PWA] Back online - checking for updates`                   | 온라인 복귀 시 업데이트 체크        |
| `[PWA] Skipping update check - offline`                      | 오프라인 상태로 체크 스킵           |
| `[PWA] Version check: server=x.x.x, client=y.y.y`            | 버전 비교 결과                      |
| `[PWA] New version detected via version.json`                | version.json으로 새 버전 감지       |
| `[PWA] Skipping version check - offline`                     | 오프라인 상태로 버전 체크 스킵      |

---

## 문제가 지속되는 경우

1. Chrome 버전 확인 (최신 버전 권장)
2. 다른 브라우저에서 테스트 (Edge, Firefox)
3. 시크릿 모드에서 테스트 (캐시 없이)
4. 다른 기기에서 테스트
5. GitHub Pages 배포 상태 확인 (Actions 탭)
