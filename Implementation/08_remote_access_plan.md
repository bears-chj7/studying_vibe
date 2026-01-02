# 원격 접속 문제 해결 계획 (상대 경로 적용)

## 목표
개발 환경이 아닌 다른 기기(원격 PC, 모바일 등)에서 접속했을 때 `localhost` 하드코딩으로 인해 API 요청이 실패하는 문제를 해결합니다.

## 변경 사항

### 1. 프론트엔드 API 호출 수정
*   **대상 파일**: `Login.jsx`, `Register.jsx`, `DocumentManager.jsx`, `UserManager.jsx`, `Chat.jsx`, `Admin.jsx` 등 모든 컴포넌트.
*   **변경 내용**:
    *   `http://localhost:5000/api/...` 형태의 절대 경로를 `/api/...` 상대 경로로 일괄 변경.
*   **원리**:
    *   개발 환경(`npm run dev`): `vite.config.js`의 프록시 설정이 `/api` 요청을 백엔드로 전달.
    *   배포 환경: 웹 서버(Nginx 등)가 같은 도메인/포트에서 서빙하므로 상대 경로가 자동으로 올바른 백엔드를 가리킴.

## 검증 계획
*   `npm run dev -- --host`로 서버 실행.
*   외부 기기(스마트폰 또는 다른 노트북)IP로 접속하여 로그인 및 기능 작동 확인.
