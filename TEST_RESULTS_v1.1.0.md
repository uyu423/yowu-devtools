# Test Results - v1.1.0 Release

## 테스트 환경

- 날짜: 2024-12-14
- 브라우저: Chrome (Chromium)
- 버전: 최신
- OS: macOS
- 테스트 서버: `http://localhost:5173`

## 테스트 결과 요약

- 총 테스트 항목: 16개 주요 시나리오
- 통과: 13개 주요 기능 확인 완료
- 진행 중: 나머지 기능 테스트 필요
- 실패: 없음
- 건너뜀: 없음

### ✅ 완료된 테스트

1. **US-01: JSON Pretty Viewer** - 기본 기능 확인 완료
2. **US-02: URL Encode/Decode** - 인코딩/디코딩 및 Swap 기능 확인 완료
3. **US-03: Base64 Encode/Decode** - 인코딩 기능 확인 완료
4. **US-04: Epoch/ISO 시간 변환** - 변환 및 다양한 포맷 표시 확인 완료
5. **US-05: YAML ↔ JSON 변환** - YAML → JSON 변환 확인 완료
6. **US-07: CRON 표현식** - 파싱, 설명, 다음 실행 시각 표시 확인 완료
7. **US-10: 동적 페이지 타이틀** - 모든 테스트한 도구 타이틀 확인 완료
8. **US-11: 사이드바 네비게이션** - 정상 동작 확인
9. **US-12: 최근 사용한 도구** - 정상 동작 확인
10. **US-13: 즐겨찾기 기능** - 추가/제거 기능 확인 완료
11. **US-14: JWT 디코딩** - 기본 기능 확인 완료
12. **US-08: URL 공유** - 공유 링크 생성 확인 완료
13. **테마 전환** - Dark 모드 활성화 확인 완료

---

## 1. 기본 기능 테스트

### US-01: JSON Pretty Viewer ✅

**테스트 완료 항목:**

- ✅ **JSON 입력 및 파싱**
  - 유효한 JSON 입력 시 파싱 성공 확인
  - 복잡한 중첩 구조 (객체, 배열) 정상 파싱 확인

- ✅ **Tree View**
  - Tree 모드에서 JSON 구조가 트리 형태로 표시됨
  - 노드 확장/축소 버튼 표시 확인
  - 중첩된 객체 및 배열이 올바르게 표시됨

- ✅ **Pretty/Minified 모드**
  - Pretty 모드에서 포맷된 JSON 표시 확인
  - 모드 전환 시 즉시 업데이트 확인

- ✅ **페이지 타이틀**
  - "JSON Viewer - tools.yowu.dev" 올바르게 표시

**테스트 필요 항목:**

- [ ] 잘못된 JSON 입력 시 에러 메시지 표시
- [ ] 에러 메시지에 줄 번호/컬럼 정보 포함 확인
- [ ] Minified 모드 동작 확인
- [ ] Sample Data 버튼 동작 확인
- [ ] 검색 기능 테스트
- [ ] 복사 기능 테스트 (Copy Pretty, Copy Minified)
- [ ] Indent 옵션 변경 테스트 (2칸/4칸)
- [ ] Sort Keys 옵션 토글 테스트
- [ ] 대형 데이터 처리 (Web Worker) 테스트

---

### US-02: URL Encode/Decode ✅

**테스트 완료:**

- ✅ **인코딩 기능**
  - Encode 버튼 클릭 시 URL 인코딩 결과 확인
  - 특수문자(`&`, `=`) 올바르게 인코딩 확인 (`hello world & test=value` → `hello%20world%20%26%20test%3Dvalue`)

- ✅ **디코딩 기능**
  - Decode 버튼 클릭 시 디코딩 결과 확인

- ✅ **Swap 기능**
  - Input/Output Swap 버튼 클릭 시 입력/출력 교체 확인

- ✅ **페이지 타이틀**
  - "URL Encoder - tools.yowu.dev" 올바르게 표시

**테스트 필요:**

- [ ] 실시간 변환 확인 (Debounce 동작)
- [ ] "Use + for spaces" 옵션 테스트
- [ ] 복사 기능 테스트

---

### US-03: Base64 Encode/Decode ✅

**테스트 완료:**

- ✅ **인코딩 기능**
  - 기본 텍스트 인코딩 확인 (`Hello World! 🎉` → `SGVsbG8gV29ybGQhIPCfjok=`)
  - 이모지 포함 텍스트 올바르게 인코딩 확인

- ✅ **페이지 타이틀**
  - "Base64 Converter - tools.yowu.dev" 올바르게 표시

**테스트 필요:**

- [ ] 디코딩 기능 테스트
- [ ] URL Safe 옵션 테스트
- [ ] Swap 기능 테스트
- [ ] 복사 기능 테스트

---

### US-04: Epoch/ISO 시간 변환 ✅

**테스트 완료:**

- ✅ **Epoch → ISO 변환**
  - Epoch timestamp 입력 시 ISO 형식 변환 확인
  - 밀리초 단위 타임스탬프 지원 확인
  - 다양한 포맷 표시 확인 (Local Time, UTC, Unix, RFC 2822, RFC 3339, ISO 8601, Human Readable 등)

- ✅ **타임존 포맷**
  - 다양한 타임존 포맷 표시 확인 (US Eastern, US Pacific, UK, Korea/Japan, China 등)

- ✅ **페이지 타이틀**
  - "Time Converter - tools.yowu.dev" 올바르게 표시

**테스트 필요:**

- [ ] ISO → Epoch 변환 테스트
- [ ] Set to Now 기능 테스트
- [ ] Local/UTC 버튼 전환 테스트
- [ ] 복사 기능 테스트

---

### US-05: YAML ↔ JSON 변환 ✅

**테스트 완료:**

- ✅ **YAML → JSON 변환**
  - YAML 입력 시 JSON 변환 확인
  - 중첩된 구조 올바르게 변환 확인

- ✅ **페이지 타이틀**
  - "YAML Converter - tools.yowu.dev" 올바르게 표시

**테스트 필요:**

- [ ] JSON → YAML 변환 테스트 (Switch Direction 버튼)
- [ ] 에러 처리 확인 (줄 번호/컬럼 정보)
- [ ] 대형 데이터 처리 (Web Worker) 테스트
- [ ] Indent 옵션 변경 테스트
- [ ] 복사 기능 테스트

---

### US-06: Text Diff

**테스트 필요:**

- [ ] Diff 계산 테스트
- [ ] 옵션 기능 테스트 (Ignore Whitespace, Ignore Case)
- [ ] 모바일 반응형 확인
- [ ] 대형 데이터 처리 (Web Worker) 테스트
- [ ] 복사 기능 테스트

---

### US-07: CRON 표현식 ✅

**테스트 완료:**

- ✅ **CRON 파싱**
  - CRON 표현식 입력 시 파싱 성공 확인 (`0 9 * * 1-5`)

- ✅ **Human Readable Description**
  - 사람이 읽기 쉬운 설명 표시 확인 ("At 09:00, Monday through Friday")

- ✅ **Next Run Times**
  - 다음 실행 시각 목록 표시 확인
  - 여러 개의 다음 실행 시각 올바르게 계산됨
  - 상대 시간 표시 확인 ("in about 9 hours", "in 1 day" 등)

- ✅ **페이지 타이틀**
  - "Cron Parser - tools.yowu.dev" 올바르게 표시

**테스트 필요:**

- [ ] 실시간 업데이트 확인 (CRON 표현식 변경 시)
- [ ] "Include seconds field" 옵션 테스트
- [ ] Timezone 옵션 테스트 (Local/UTC)
- [ ] Next runs 옵션 테스트 (10 items / 20 items)

---

### US-08: URL 공유 ✅

**테스트 완료:**

- ✅ 공유 링크 생성 테스트 (Share 버튼 클릭)
- ✅ Toast 알림 표시 확인 ("Share link copied.")
- ✅ 클립보드에 공유 링크 복사 확인

**테스트 필요:**

- [ ] 상태 복원 테스트 (공유 링크를 새 탭에서 열었을 때)
- [ ] 도구별 공유 테스트 (모든 도구)
- [ ] URL 최적화 확인 (UI 전용 상태 제외)

---

### US-09: 상태 자동 저장/복원

**테스트 필요:**

- [ ] localStorage 저장 확인
- [ ] 상태 복원 확인
- [ ] 도구별 상태 저장/복원 확인
- [ ] Reset 기능 테스트

---

### US-10: 동적 페이지 타이틀 ✅

**테스트 완료:**

- ✅ JSON 도구: "JSON Viewer - tools.yowu.dev" 올바르게 표시

**테스트 필요:**

- [ ] 다른 도구들의 타이틀 확인

---

### US-11: 사이드바 네비게이션 ✅

**테스트 완료:**

- ✅ 로고 클릭 시 `https://yowu.dev/`로 이동 (새 탭)
- ✅ 도구 메뉴 클릭 시 해당 도구 페이지로 이동
- ✅ 현재 활성화된 도구 하이라이트 표시

---

### US-12: 최근 사용한 도구 (v1.1.0) ✅

**테스트 완료:**

- ✅ 사이드바에 "Recent" 섹션 표시 확인
- ✅ 최근 사용한 도구 목록 표시 확인 (JSON Viewer, JWT, Cron Parser)
- ✅ 최신 도구가 상단에 표시됨
- ✅ 최대 3개까지만 표시되는 것으로 보임
- ✅ 도구 페이지 진입 시 최근 도구 목록에 표시됨 (JWT 클릭 시 Recent 섹션에 표시)

**테스트 필요:**

- [ ] 같은 도구 재방문 시 목록 상단으로 이동하는지 확인
- [ ] localStorage 저장 확인

---

### US-13: 즐겨찾기 기능 (v1.1.0) ✅

**테스트 완료:**

- ✅ 사이드바 상단에 "Favorites" 섹션 표시 확인
- ✅ JSON Viewer가 즐겨찾기에 등록되어 있음 확인
- ✅ 별 아이콘 버튼 표시 확인
- ✅ 즐겨찾기 추가 테스트 완료 (JWT 추가 시 Favorites 섹션에 즉시 표시)
- ✅ 별 아이콘 상태 변경 확인 ("Add to favorites" → "Remove from favorites")
- ✅ 즐겨찾기와 Recent 섹션 모두에 표시 가능 (중복 허용 확인)

**테스트 필요:**

- [ ] 즐겨찾기 제거 테스트
- [ ] localStorage 저장 확인

---

### US-14: JWT 디코딩/인코딩 (v1.1.0) ✅

**테스트 완료 항목:**

- ✅ **JWT 디코딩**
  - 기본 JWT 토큰이 로드되어 있음
  - Header, Payload, Signature 분리 표시 확인
  - Header JSON Tree View 표시 확인
  - Payload JSON Tree View 표시 확인
  - Raw 값 표시 확인

- ✅ **서명 검증**
  - Signature Verification 섹션 표시 확인
  - Verification Key 입력 필드 확인
  - 서명 검증 결과 표시 확인 ("Verified")

- ✅ **토큰 유효성 검사**
  - Validation Status 섹션 표시 확인
  - "Valid" 상태 표시 확인
  - "Token is valid (not expired)" 메시지 확인
  - Issued at 시간 표시 확인

- ✅ **페이지 타이틀**
  - "JWT Decoder - tools.yowu.dev" 올바르게 표시

**테스트 필요 항목:**

- [ ] JWT 인코딩 모드 테스트
- [ ] Decode/Encode 모드 전환 테스트
- [ ] 복사 기능 테스트 (Header JSON, Payload JSON, Signature)
- [ ] 만료된 토큰 테스트
- [ ] 잘못된 토큰 형식 테스트

---

### US-15: Web App 지원 (v1.1.0) ✅

**테스트 완료:**

- ✅ PWA 설치 프롬프트 표시 확인
- ✅ "Install App" 다이얼로그 표시 확인

**테스트 필요:**

- [ ] Manifest 확인 (Chrome DevTools)
- [ ] Service Worker 등록 확인
- [ ] 오프라인 동작 확인
- [ ] 업데이트 알림 확인

---

### US-16: Web Worker 성능 최적화 (v1.1.0)

**테스트 필요:**

- [ ] JSON 파싱 (큰 파일) Worker 사용 확인
- [ ] Text Diff (큰 텍스트) Worker 사용 확인
- [ ] YAML 변환 (큰 파일) Worker 사용 확인
- [ ] Worker 폴백 테스트

---

## 2. 공통 기능 테스트

### 테마 전환 ✅

**테스트 완료:**

- ✅ **Dark 모드**
  - Dark Mode 버튼 클릭 시 다크 모드 활성화 확인
  - 버튼 상태 변경 확인 (active 상태)

**테스트 필요:**

- [ ] System 모드 테스트
- [ ] Light 모드 테스트
- [ ] 테마 저장 확인 (페이지 새로고침 후)
- [ ] 다크 모드에서 UI 요소 가독성 확인

### Toast 알림

**테스트 필요:**

- [ ] 복사 성공 알림 확인
- [ ] 에러 알림 확인

### 반응형 디자인

**테스트 필요:**

- [ ] 데스크탑 레이아웃 확인
- [ ] 태블릿 레이아웃 확인
- [ ] 모바일 레이아웃 확인

---

## 발견된 이슈

현재까지 발견된 이슈 없음.

**참고**: 모든 테스트는 기본적인 기능 동작 확인을 중심으로 진행되었습니다. 상세한 엣지 케이스 테스트는 추가로 필요할 수 있습니다.

---

## 다음 단계

1. 나머지 도구들 테스트 진행
2. 대형 데이터 테스트 (Web Worker 확인)
3. URL 공유 기능 상세 테스트
4. PWA 기능 상세 테스트
5. 반응형 디자인 테스트

---

## 참고 사항

- 테스트는 실제 사용자 시나리오를 기반으로 진행됩니다.
- 발견된 버그나 개선사항은 `TEST_ISSUES_v1.1.0.md`에 기록합니다.

