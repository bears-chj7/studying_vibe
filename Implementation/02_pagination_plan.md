# 문서 목록 페이지네이션 구현 계획

## 목표
문서 목록이 길어질 경우를 대비하여 서버 사이드 페이지네이션을 구현합니다.

## 변경 사항

### 1. 백엔드 (`backend/blueprints/documents.py`)
*   `GET /api/documents` 엔드포인트 수정.
*   쿼리 파라미터 `page` (기본값 1), `limit` (기본값 10) 수신.
*   SQL 쿼리에 `LIMIT` 및 `OFFSET` 적용.
*   전체 문서 개수(`total`) 계산 쿼리 추가.
*   응답 포맷에 `total`, `page`, `limit`, `total_pages` 포함.

### 2. 프론트엔드 (`frontend/src/components/DocumentManager.jsx`)
*   **상태 관리**: `page`, `limit`, `totalDocs` 상태 추가.
*   **API 호출**: 문서 목록 요청 시 현재 페이지와 제한 값을 파라미터로 전송.
*   **UI 구성**:
    *   목록 하단에 페이지 이동 버튼 (<, >) 및 현재 페이지 정보 표시.
    *   페이지 당 항목 수(Rows per page) 선택 드롭다운 추가.

## 검증 계획
*   10개 이상의 문서를 생성하여 페이지 분리 확인.
*   페이지 이동 및 항목 수 변경 시 목록 갱신 확인.
