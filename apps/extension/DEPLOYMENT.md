# Chrome Extension 배포 가이드

이 문서는 Yowu DevTools Companion 확장 프로그램을 Chrome Web Store에 배포하는 방법을 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [Google Cloud Console 설정](#google-cloud-console-설정)
3. [리프레시 토큰 생성](#리프레시-토큰-생성)
4. [GitHub Secrets 설정](#github-secrets-설정)
5. [배포 실행](#배포-실행)
6. [수동 배포](#수동-배포)

---

## 사전 준비

### 1. Chrome Web Store Developer 계정

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)에 접속
- 개발자 계정이 없다면 등록 (일회성 $5 등록비)
- 확장 프로그램을 처음 등록하여 Extension ID 획득

### 2. 확장 프로그램 최초 등록

자동 배포 전에 수동으로 한 번 등록해야 합니다:

1. `apps/extension`에서 `pnpm run build` 실행
2. `dist` 폴더를 ZIP으로 압축
3. Chrome Web Store Developer Dashboard에서 "새 항목" 클릭
4. ZIP 파일 업로드
5. 스토어 목록 정보 입력:
   - 설명
   - 스크린샷 (1280x800 또는 640x400)
   - 아이콘 (128x128)
   - 카테고리: Developer Tools
   - 언어: 한국어/English
6. 개인정보처리방침 URL 입력 (필요시)
7. "Draft로 저장" 또는 "Publish" 클릭

등록 후 URL에서 **Extension ID**를 확인합니다:

```
https://chrome.google.com/webstore/devconsole/.../items/[EXTENSION_ID]
```

---

## Google Cloud Console 설정

### 1. 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2. Chrome Web Store API 활성화

1. 좌측 메뉴에서 **APIs & Services** > **Library** 선택
2. "Chrome Web Store API" 검색
3. **Chrome Web Store API** 클릭 후 **Enable** 클릭

### 3. OAuth 동의 화면 설정

1. **APIs & Services** > **OAuth consent screen** 선택
2. User Type: **External** 선택
3. 앱 정보 입력:
   - App name: `Yowu DevTools Extension Deploy`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
4. **Save and Continue** 클릭
5. Scopes 단계에서 **Add or Remove Scopes** 클릭
6. `https://www.googleapis.com/auth/chromewebstore` 추가
7. **Save and Continue** 클릭
8. Test users 단계에서 본인 이메일 추가
9. **Save and Continue** 클릭

### 4. OAuth 2.0 자격증명 생성

1. **APIs & Services** > **Credentials** 선택
2. **+ CREATE CREDENTIALS** > **OAuth client ID** 클릭
3. Application type: **Desktop app** 선택
4. Name: `Chrome Extension Deploy CLI`
5. **Create** 클릭
6. **Client ID**와 **Client Secret** 저장

---

## 리프레시 토큰 생성

### chrome-webstore-upload-cli 사용

```bash
# 전역 설치
npm install -g chrome-webstore-upload-cli

# 또는 npx로 실행
npx chrome-webstore-upload-cli init
```

대화형 프롬프트가 나타납니다:

```
? Client ID: [Google Cloud에서 복사한 Client ID]
? Client Secret: [Google Cloud에서 복사한 Client Secret]
```

입력 후 브라우저가 열리고 Google 로그인 및 권한 승인을 요청합니다.
승인하면 터미널에 **Refresh Token**이 출력됩니다.

> ⚠️ 리프레시 토큰은 한 번만 표시됩니다. 안전하게 저장하세요!

---

## GitHub Secrets 설정

GitHub 저장소에서 다음 시크릿을 설정합니다:

1. Repository > **Settings** > **Secrets and variables** > **Actions**
2. **Variables** 탭에서:
   - `CHROME_EXTENSION_DEPLOY_ENABLED`: `true`
3. **Secrets** 탭에서 **New repository secret** 클릭:

| Secret Name            | 값                                       | 설명                          |
| ---------------------- | ---------------------------------------- | ----------------------------- |
| `CHROME_EXTENSION_ID`  | Chrome Web Store의 Extension ID          | 첫 업로드 후 자동 생성 (선택) |
| `CHROME_CLIENT_ID`     | Google Cloud OAuth Client ID             | OAuth 인증용 (필수)           |
| `CHROME_CLIENT_SECRET` | Google Cloud OAuth Client Secret         | OAuth 인증용 (필수)           |
| `CHROME_REFRESH_TOKEN` | chrome-webstore-upload-cli로 생성한 토큰 | OAuth 인증용 (필수)           |

> **참고**: `CHROME_EXTENSION_ID`는 첫 업로드 후 Chrome Web Store에서 자동으로 생성됩니다. 처음에는 비워두고, 첫 업로드 후 ID를 확인하여 추가하세요.

### Environment 설정 (선택사항)

배포 승인 프로세스를 추가하려면:

1. **Settings** > **Environments** > **New environment**
2. Name: `chrome-web-store`
3. Required reviewers 추가 (승인자 지정)
4. Wait timer 설정 (선택)

---

## 배포 실행

### 자동 배포 (Push 트리거)

다음 경로에 변경이 있으면 자동으로 빌드 및 업로드됩니다:

- `apps/extension/**`
- `packages/shared/**`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`

> ⚠️ 자동 배포는 Chrome Web Store에 **업로드만** 합니다 (Draft 상태).
> 실제 게시는 수동으로 하거나 workflow_dispatch에서 publish=true를 선택해야 합니다.

### 수동 배포 (workflow_dispatch)

1. GitHub 저장소 > **Actions** 탭
2. **Deploy Chrome Extension** 워크플로우 선택
3. **Run workflow** 클릭
4. `publish` 옵션 선택:
   - `false`: 업로드만 (Draft 상태)
   - `true`: 업로드 + 게시

---

## 수동 배포

자동화 없이 수동으로 배포하려면:

```bash
cd apps/extension

# 빌드
pnpm run build

# ZIP 생성
cd dist && zip -r ../extension.zip ./* && cd ..

# 업로드 (게시 안 함)
npx chrome-webstore-upload-cli upload \
  --source extension.zip \
  --extension-id $EXTENSION_ID \
  --client-id $CLIENT_ID \
  --client-secret $CLIENT_SECRET \
  --refresh-token $REFRESH_TOKEN

# 업로드 + 게시
npx chrome-webstore-upload-cli upload \
  --source extension.zip \
  --extension-id $EXTENSION_ID \
  --client-id $CLIENT_ID \
  --client-secret $CLIENT_SECRET \
  --refresh-token $REFRESH_TOKEN \
  --auto-publish
```

---

## 버전 관리

버전은 `manifest.json`의 `version` 필드에서 관리됩니다.

```json
{
  "version": "1.0.0"
}
```

Chrome Web Store 정책:

- 버전은 업로드할 때마다 증가해야 합니다
- 형식: `X.Y.Z` 또는 `X.Y.Z.W` (각각 0-65535 범위)
- 동일한 버전으로 다시 업로드하면 오류 발생

### 버전 증가 방법

```bash
# package.json과 manifest.json의 버전을 동시에 업데이트
cd apps/extension
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

---

## 문제 해결

### "Item not found" 오류

- Extension ID가 올바른지 확인
- 확장 프로그램이 Chrome Web Store에 등록되어 있는지 확인

### "Invalid refresh token" 오류

- 리프레시 토큰을 다시 생성
- OAuth 동의 화면의 게시 상태 확인 (Testing → Production)

### "Rate limit exceeded" 오류

- Chrome Web Store API는 하루 업로드 횟수 제한이 있음
- 몇 시간 후 다시 시도

### "The item has already been uploaded with version X.Y.Z"

- `manifest.json`의 버전을 증가시켜야 함

---

## 참고 자료

- [Chrome Web Store API 문서](https://developer.chrome.com/docs/webstore/api)
- [chrome-webstore-upload-cli](https://github.com/nicosResworker/chrome-webstore-upload-cli)
- [mnao305/chrome-extension-upload Action](https://github.com/mnao305/chrome-extension-upload)
