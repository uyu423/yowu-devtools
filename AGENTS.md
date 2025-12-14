# Repository Guidelines

## Project Structure & Module Organization
`src/`는 React + TypeScript 핵심 코드가 위치하며, 뷰 로직은 `components/`, 재사용 훅은 `hooks/`, 헬퍼는 `lib/`, 에디터 전용 도구는 `tools/`에 둡니다. 정적 자산은 `src/assets/`, 전역 스타일은 `App.css`·`index.css`에, Tailwind 계층 설정은 `tailwind.config.js`에서 관리합니다. `public/`은 정적 배포물, `dist/`는 빌드 산출물이라 커밋하지 않습니다.

## Build, Test, and Development Commands
- `npm run dev`: Vite 개발 서버를 5173 포트에서 실행하고 HMR을 제공합니다.
- `npm run build`: `tsc -b`로 타입을 검사한 뒤 최적화된 번들을 `dist/`에 생성합니다.
- `npm run preview`: 직전 빌드 결과를 로컬에서 서빙하며 릴리스 직전 검증에 사용합니다.
- `npm run lint`: `eslint.config.js` 규칙으로 전체 프로젝트를 검사해 경고를 제거합니다.

## Coding Style & Naming Conventions
JSX/TSX는 2칸 스페이스 인덴트를 사용하고 함수형 컴포넌트·훅 기반 상태 관리를 선호합니다. 컴포넌트 파일은 PascalCase(`CodeEditorPanel.tsx`), 함수·변수는 camelCase, 훅 파일은 `use-editor.ts`처럼 kebab-case로 맞춥니다. 조건부 클래스는 `clsx` 혹은 `tailwind-merge`로 병합해 중복을 피합니다.

## Testing Guidelines
현재 공식 테스트는 없지만 향후 스펙은 `src/<feature>/__tests__/`에 `*.test.tsx` 형식으로 배치합니다. Vitest + React Testing Library 조합을 기본으로 하고, 에디터 의존 로직은 목킹하여 결정적 테스트를 유지합니다. 테스트 추가 시 `npm run test` 스크립트를 정의하고 PR 템플릿에 실행 결과를 포함하세요.

## Commit & Pull Request Guidelines
Git 기록은 짧은 명령형 문장(`add project document`, `init project & front ui scafolding`)을 사용하므로 같은 톤을 유지합니다. 한 줄 72자 이하로 "무엇을" 설명하고, 관련 이슈 번호는 본문에 `Refs: #123` 형태로 남깁니다. PR에는 목적 요약, 시각적 변경 시 스크린샷, 수행한 명령 체크리스트(`dev`, `build`, `lint`)를 포함하고, 로컬에서 린트·빌드를 통과한 후 리뷰를 요청합니다.

## Environment & Tooling Tips
Node 20 이상과 npm 10을 사용해 `package-lock.json`과 일관성을 유지합니다. `npm install`만 사용하며 다른 패키지 매니저를 혼용하지 않습니다. Tailwind·PostCSS 토큰을 바꿀 때는 `tailwind.config.js`, `postcss.config.js`, `src/index.css`를 함께 업데이트하고, 디자인 시스템 변경 사항을 README나 SAS 문서에 기록하세요.
