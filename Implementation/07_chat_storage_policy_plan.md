# 채팅 기록 저장 정책 변경 계획 (SessionStorage)

## 목표
공용 PC 등에서의 보안을 위해 채팅 기록을 영구 저장소(`localStorage`)가 아닌 세션 기반 저장소(`sessionStorage`)로 변경합니다. 브라우저 종료 시 기록이 자동 삭제되도록 합니다.

## 변경 사항

### 1. 프론트엔드 변경
*   **저장소 교체**: `Chat.jsx` 및 `App.jsx`에서 `localStorage` 사용 코드를 `sessionStorage`로 변경.
*   **로그인/로그아웃 처리**:
    *   `handleLogin`: 로그인 시 이전 사용자의 잔존 데이터가 있다면 삭제.
    *   `handleLogout`: 로그아웃 시 현재 세션의 채팅 기록 삭제.
*   **키 관리**: 사용자별로 키 분리 (`chat_history_${username}`)하여 다중 사용자 충돌 방지.

## 검증 계획
*   채팅 후 로그아웃 -> 채팅 기록 삭제 확인.
*   채팅 후 브라우저 탭 닫고 다시 열기 -> 기록 삭제 확인 (SessionStorage 특성).
*   새로고침 -> 기록 유지 확인 (SessionStorage 특성).
