# 보안 사용자명 전송 (Secure Username Transmission) 구현 계획

## 목표
URL 쿼리 파라미터(`?username=...`)에 사용자 ID가 노출되는 것을 방지하여 개인정보 보호 및 보안을 강화합니다. 대신 HTTP 헤더(`X-Username`)나 JSON Body를 통해 전송합니다.

## 변경 사항

### 1. 백엔드 (`backend/auth_middleware.py` 및 엔드포인트)
*   **미들웨어 수정**: `check_abac` 함수가 `request.headers`의 `X-Username`을 우선적으로 확인하도록 변경.
*   **엔드포인트 수정**:
    *   `GET` 및 `DELETE` 요청: `request.args` 대신 `request.headers` 사용.
    *   `POST` 및 `PUT` 요청: JSON Body에서 `username` 필드 확인.

### 2. 프론트엔드 (`frontend/src/components/...`)
*   **DocumentManager.jsx** 및 **UserManager.jsx**:
    *   `GET`, `DELETE` 요청 시 `headers: { 'X-Username': user.username }` 추가 및 URL 파라미터 제거.
    *   `PUT` 요청 시 `body`에 `username` 포함.

## 검증 계획
*   브라우저 네트워크 탭 확인: API 요청 URL에 `?username=`이 없는지 확인.
*   헤더 확인: 요청 헤더에 `X-Username`이 포함되어 있는지 확인.
*   기능 확인: 문서 목록 조회, 삭제, 사용자 관리 등 기존 기능이 정상 작동하는지 확인.
