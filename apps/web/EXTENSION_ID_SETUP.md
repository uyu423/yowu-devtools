# Web 패키지 Extension ID 설정 가이드

web 패키지(tools.yowu.dev)에서 Chrome Extension과 통신하기 위해 Extension ID가 필요합니다.

## Extension ID란?

Extension ID는 Chrome Extension의 고유 식별자입니다. web 애플리케이션은 이 ID를 사용하여 확장 프로그램과 메시지를 주고받습니다.

## Extension ID 획득 방법

Extension ID는 Chrome Web Store에 확장 프로그램을 업로드한 후에만 알 수 있습니다.

### 1단계: Extension을 Chrome Web Store에 업로드

1. `apps/extension`에서 빌드:
   ```bash
   cd apps/extension
   pnpm run build
   ```

2. `dist` 폴더를 ZIP으로 압축

3. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)에서 업로드

4. 업로드 후 URL에서 Extension ID 확인:
   ```
   https://chrome.google.com/webstore/devconsole/.../items/[EXTENSION_ID]
   ```
   
   또는 확장 프로그램 상세 페이지에서 확인:
   ```
   https://chrome.google.com/webstore/detail/[EXTENSION_ID]
   ```

### 2단계: Extension ID를 환경 변수로 설정

#### Extension ID 목록

| 환경 | Extension ID | 용도 |
|------|--------------|------|
| **개발 환경** | `lhaoapjoifnhfnlklbkggodnkpeikgme` | 로컬 개발용 확장 프로그램 |
| **프로덕션** | `jmkojnlpffcdelhhefnnjgbgffiaigce` | Chrome Web Store에 배포된 확장 프로그램 |

#### 로컬 개발 시

**방법 1: .env.local 파일 사용 (권장)**

1. `apps/web/` 디렉토리에 `.env.local` 파일 생성:

```bash
cd apps/web
cat > .env.local << EOF
# Development Extension ID
VITE_EXTENSION_ID=lhaoapjoifnhfnlklbkggodnkpeikgme
EOF
```

또는 프로덕션 Extension ID를 사용하려면:

```bash
cat > .env.local << EOF
# Production Extension ID
VITE_EXTENSION_ID=jmkojnlpffcdelhhefnnjgbgffiaigce
EOF
```

2. Vite가 자동으로 `.env.local` 파일을 로드합니다
3. `.env.local` 파일은 `.gitignore`에 추가되어 있어 커밋되지 않습니다
4. 환경 변수가 설정되지 않으면 `constants.ts`의 프로덕션 ID가 기본값으로 사용됩니다

**방법 2: 환경 변수로 직접 설정**

```bash
export VITE_EXTENSION_ID="<Extension ID>"
pnpm run build
```

#### CI/CD (GitHub Actions)

1. GitHub 저장소 > **Settings** > **Secrets and variables** > **Actions**
2. **New repository secret** 클릭
3. Name: `VITE_EXTENSION_ID`
4. Value: Extension ID (예: `abcdefghijklmnopqrstuvwxyz123456`)
5. **Add secret** 클릭

GitHub Actions 워크플로우(`.github/workflows/deploy.yml`)에서 자동으로 환경 변수로 주입됩니다.

## 작동 방식

### 코드에서 사용

`apps/web/src/tools/api-tester/hooks/useExtension.ts`에서:

```typescript
import { EXTENSION_ID as DEFAULT_EXTENSION_ID } from '../constants';

// Get extension ID from environment or use default from constants
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || DEFAULT_EXTENSION_ID;
```

환경 변수가 설정되어 있으면 해당 ID를 사용하고, 없으면 `constants.ts`의 프로덕션 Extension ID가 기본값으로 사용됩니다.

### 빌드 프로세스

1. **로컬 빌드**:
   - `.env.local` 파일 또는 환경 변수 `VITE_EXTENSION_ID`에서 읽기
   - Vite가 빌드 시 환경 변수를 코드에 주입

2. **CI/CD 빌드**:
   - GitHub Secrets의 `VITE_EXTENSION_ID`가 환경 변수로 자동 주입
   - 빌드된 JavaScript 번들에 Extension ID가 포함됨

## Extension ID와 Extension Key의 관계

| 항목 | 용도 | 저장 위치 |
|------|------|----------|
| **Extension Key** (공개 키) | Extension ID 고정 | GitHub Secrets: `CHROME_EXTENSION_KEY` |
| **Extension ID** | Web 앱에서 Extension과 통신 | GitHub Secrets: `VITE_EXTENSION_ID` |

- Extension Key는 extension 패키지의 manifest.json에 주입되어 Extension ID를 고정합니다
- Extension ID는 web 패키지에서 Extension과 통신할 때 사용합니다
- 같은 Extension Key를 사용하면 항상 같은 Extension ID가 생성됩니다

## 문제 해결

### Extension ID가 설정되지 않음

**로컬 개발 시:**
- `.env.local` 파일이 `apps/web/` 디렉토리에 있는지 확인
- `.env.local` 파일에 `VITE_EXTENSION_ID` 환경 변수가 설정되어 있는지 확인
- Vite는 `.env.local` 파일을 자동으로 로드합니다

**CI/CD 빌드 시:**
- GitHub Secrets에 `VITE_EXTENSION_ID`가 설정되어 있는지 확인
- 워크플로우에서 환경 변수가 제대로 주입되는지 확인

### Extension과 통신 실패

- Extension ID가 올바른지 확인
- Extension이 설치되어 있는지 확인
- Extension의 `externally_connectable` 설정이 `tools.yowu.dev`를 포함하는지 확인

## 보안 주의사항

- Extension ID는 공개 정보입니다 (Chrome Web Store URL에 포함됨)
- 하지만 GitHub Secrets에 저장하여 관리하는 것이 좋습니다
- `.env.local` 파일은 커밋하지 마세요 (`.gitignore`에 추가됨)

