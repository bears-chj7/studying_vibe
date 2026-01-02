# 임베딩 설정 (Chunking) 구현 계획

## 목표
RAG 성능 튜닝을 위해 사용자가 문서 처리 시 청크 크기(Chunk Size)와 오버랩(Overlap)을 설정할 수 있도록 합니다.

## 변경 사항

### 1. 백엔드
*   **`backend/rag.py`**: `ingest_file` 함수가 `chunk_size`와 `chunk_overlap`을 인자로 받도록 수정하고 `RecursiveCharacterTextSplitter`에 적용.
*   **`backend/blueprints/documents.py`**: 업로드 API(`POST /api/documents`)에서 폼 데이터로 설정값을 받아 `ingest_file`로 전달.

### 2. 프론트엔드
*   **설정 UI**: `IngestionSettingsDialog.jsx` 컴포넌트 생성 (설정값 입력 폼).
*   **상태 저장**: 설정값을 `localStorage`에 저장하여 유지.
*   **DocumentManager**: 업로드 섹션에 "설정(Config)" 버튼 추가 및 현재 설정값 표시. 파일 업로드 시 설정값을 함께 전송.

## 검증 계획
*   설정값을 변경하고 파일 업로드.
*   Vector Viewer에서 생성된 청크의 크기가 설정대로 반영되었는지 확인.
