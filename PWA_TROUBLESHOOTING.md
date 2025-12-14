# PWA 설치 문제 해결 가이드

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

### 3. 문제 해결 단계

#### Step 1: 캐시 및 Service Worker 초기화
1. Chrome DevTools → Application → Storage → "Clear site data" 클릭
2. Application → Service Workers → "Unregister" 클릭
3. 페이지 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

#### Step 2: Manifest 확인
1. `https://tools.yowu.dev/manifest.json` 접속
2. JSON이 올바르게 표시되는지 확인
3. 아이콘 경로가 올바른지 확인 (`/icon-192.png`, `/icon-512.png`)

#### Step 3: Service Worker 확인
1. Chrome DevTools → Application → Service Workers
2. Service Worker가 등록되어 있는지 확인
3. 상태가 "activated"인지 확인

#### Step 4: 설치 프롬프트 강제 표시 (테스트용)
Chrome 주소창에 다음을 입력:
```
chrome://flags/#enable-desktop-pwas-install-dialog
```
"Enabled"로 설정 후 브라우저 재시작

### 4. 현재 설정 확인

#### manifest.json 위치
- 빌드 후: `dist/manifest.json`
- 배포 후: `https://tools.yowu.dev/manifest.json`

#### Service Worker 위치
- 빌드 후: `dist/sw.js`
- 배포 후: `https://tools.yowu.dev/sw.js`

#### 아이콘 위치
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)

### 5. 추가 확인 사항

#### 이미 설치된 경우
- Chrome이 이미 설치된 앱에 대해서는 설치 프롬프트를 표시하지 않습니다
- `chrome://apps`에서 확인

#### 이전에 "설치 안 함" 선택한 경우
- Chrome이 사용자의 선택을 기억합니다
- 캐시 및 쿠키 삭제 후 다시 시도

#### 개발 환경 (localhost)
- localhost에서는 설치 프롬프트가 표시되지 않을 수 있습니다
- 프로덕션 환경(HTTPS)에서 테스트 권장

### 6. 디버깅 명령어

브라우저 Console에서 실행:

```javascript
// Service Worker 상태 확인
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Manifest 확인
fetch('/manifest.json')
  .then(res => res.json())
  .then(manifest => console.log('Manifest:', manifest));

// 설치 가능 여부 확인
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available:', e);
});
```

### 7. vite-plugin-pwa 설정 확인

현재 설정 (`vite.config.ts`):
- ✅ `registerType: 'autoUpdate'` - 자동 업데이트
- ✅ `manifestFilename: 'manifest.json'` - manifest 파일명
- ✅ `manifest` - 모든 필수 필드 포함
- ✅ `workbox` - Service Worker 설정

### 8. 배포 후 확인

배포 후 다음을 확인하세요:

1. **HTTPS 확인**: `https://tools.yowu.dev`로 접속
2. **Manifest 확인**: `https://tools.yowu.dev/manifest.json` 접속
3. **Service Worker 확인**: Chrome DevTools → Application → Service Workers
4. **설치 아이콘**: 주소창 오른쪽에 설치 아이콘 표시 확인

### 9. 문제가 지속되는 경우

1. Chrome 버전 확인 (최신 버전 권장)
2. 다른 브라우저에서 테스트 (Edge, Firefox)
3. 시크릿 모드에서 테스트
4. 다른 기기에서 테스트


