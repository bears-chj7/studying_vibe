# UI 개선 및 실시간 진행률 표시 구현 계획

## 목표
사용자 인터페이스를 개선하고 파일 업로드 시 상세 진행 상황을 제공하여 사용자 경험을 향상시킵니다.

## 변경 사항

### 1. Vector Viewer UI 개선
*   **목표**: 닫기 버튼의 위치를 다른 설정 창과 일관되게 조정합니다.
*   **파일**: `frontend/src/components/VectorViewer.jsx`

### 2. 실시간 업로드 진행률 표시
*   **목표**: 대용량 PDF 처리 시 사용자가 진행 상황을 알 수 있도록 로그를 스트리밍합니다.
*   **백엔드**:
    *   `rag.py`: 문서 처리 함수(`ingest_file`)를 제너레이터(Generator)로 변환하여 진행 상태를 `yield` 하도록 수정.
    *   `documents.py`: 업로드 API 응답을 일반 JSON에서 스트리밍 응답(NDJSON)으로 변경.
*   **프론트엔드**:
    *   `DocumentManager.jsx`: `fetch` API와 `ReadableStream`을 사용하여 백엔드에서 오는 로그를 실시간으로 파싱하고 화면에 표시하는 UI 추가.

## 검증 계획
*   파일 업로드 시 "OCR 처리 중...", "임베딩 중..." 등의 로그가 실시간으로 뜨는지 확인.
*   Vector Viewer 닫기 버튼 위치 확인.
