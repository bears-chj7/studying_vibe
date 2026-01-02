# Studying Vibe (현준이의 바이브 코딩 놀이터)

**Studying Vibe**는 RAG(Retrieval-Augmented Generation) 기술을 기반으로 한 학습 보조 AI 플랫폼입니다. 사용자가 PDF 학습 자료를 업로드하면, AI가 해당 문서를 분석하여 학습 관련 질문에 정확하게 답변해 줍니다. Google Gemini와 로컬 Ollama 모델을 모두 지원하며, 보안과 사용자 편의성을 고려하여 설계되었습니다.

---

## 🚀 프로젝트 소개 및 의도

이 프로젝트는 다음과 같은 목표로 개발되었습니다.
*   **개인화된 학습 경험 제공**: 일반적인 챗봇이 아닌, *내 공부 자료*를 기반으로 답변하는 맞춤형 AI 튜터 구현.
*   **최신 AI 기술의 실용적 적용**: RAG 파이프라인(PDF 파싱, 임베딩, 벡터 검색)의 End-to-End 구현 학습 및 검증.
*   **보안과 확장성**: ABAC(속성 기반 접근 제어)와 보안 전송 프로토콜을 적용하여 실제 서비스 가능한 수준의 아키텍처 지향.
*   **하이브리드 AI 환경**: 클라우드 API(Gemini)와 온프레미스 모델(Ollama)을 자유롭게 전환하여 비용 및 데이터 프라이버시 유연성 확보.

---

## ✨ 주요 기능 (Key Features)

### 1. 📚 스마트 문서 관리 (RAG)
*   **PDF 업로드 및 자동 변환**: PDF 파일을 업로드하면 자동으로 텍스트를 추출하고 벡터화(Embedding)합니다.
*   **OCR 지원**: 텍스트가 없는 스캔본 PDF는 자동으로 `Tesseract` OCR을 통해 텍스트를 추출합니다. (한/영 지원)
*   **청크(Chunk) 튜닝**: 문서 특성에 맞춰 Chunk Size와 Overlap을 사용자가 직접 설정할 수 있습니다.
*   **재임베딩(Re-ingestion)**: 설정 변경 시 기존 문서를 손쉽게 다시 처리할 수 있습니다.

### 2. 💬 AI 채팅 인터페이스
*   **멀티 모델 지원**: 고성능 **Google Gemini**와 로컬 보안 **Ollama (Llama 3)** 모델 중 선택 가능.
*   **출처 기반 답변**: AI가 답변 시 어떤 문서의 내용을 참조했는지 바탕으로 대답합니다.
*   **마크다운 렌더링**: 코드 블록, 표, 리스트 등 깔끔한 마크다운 포맷을 지원합니다.
*   **대화 관리**: "새 채팅" 기능으로 문맥 전환이 자유롭습니다.

### 3. 🔐 보안 및 사용자 관리
*   **ABAC 권한 시스템**: '사용자 관리', '문서 열람' 등 세분화된 속성(Attribute) 기반의 접근 제어.
*   **보안 전송**: 사용자명 등 민감 정보는 URL이 아닌 HTTP 헤더(`X-Username`)로 안전하게 전송.
*   **데이터 프라이버시**: 채팅 기록은 서버가 아닌 세션 스토리지(SessionStorage)에만 임시 저장되어 개인정보를 보호합니다.

### 4. 🌐 편의성 및 확장성
*   **다국어 지원 (i18n)**: 한국어와 영어를 완벽하게 지원하며, 브라우저 환경에 따라 자동 감지하거나 설정 가능합니다.
*   **반응형 UI**: 데스크탑 및 모바일 환경을 고려한 깔끔한 UI 디자인.

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | Vite 기반의 SPA, Context API 및 i18next 적용 |
| **Backend** | ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white) | RESTful API 서버, Blueprint 모듈화 |
| **Database** | ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=flat&logo=mariadb&logoColor=white) | 사용자 정보 및 문서 메타데이터 저장 |
| **Vector DB** | ![ChromaDB](https://img.shields.io/badge/ChromaDB-FD6F22?style=flat&logo=chroma&logoColor=white) | 문서 임베딩 벡터 저장소 (LangChain 연동) |
| **AI / LLM** | ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white) | RAG 파이프라인 구성 |
| | ![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=google&logoColor=white) | 고성능 클라우드 LLM |
| | ![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat&logo=ollama&logoColor=white) | 로컬 LLM 실행 환경 |

---

## 📁 프로젝트 구조 (Directory Structure)

```
studying_vibe/
├── backend/            # Flask API 서버 및 RAG 로직
│   ├── blueprints/     # API 라우트 모듈 (documents, users)
│   ├── rag.py          # LangChain RAG 서비스 클래스
│   ├── app.py          # 메인 애플리케이션 진입점
│   └── ...
├── frontend/           # React 클라이언트
│   ├── src/
│   │   ├── components/ # UI 컴포넌트 (Chat, DocumentManager 등)
│   │   ├── locales/    # 다국어 번역 파일 (ko, en)
│   │   └── ...
└── Implementation/     # 구현 상세 문서 및 워크플로우 명세
    ├── rag_workflow_v0.1.md  # RAG 시스템 상세 설계도
    └── ...
```

---

## 🚀 시작하기 (Getting Started)

상세한 빌드 및 실행 방법은 [Howtobuild.md](./Howtobuild.md) 문서를 참고해 주세요.

### 요약
1.  **환경 설정**: Python, MariaDB, Ollama 설치.
2.  **데이터베이스 초기화**: `backend/init_db.py` 실행.
3.  **백엔드 실행**:
    ```bash
    cd backend
    python app.py
    ```
4.  **프론트엔드 실행**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 📝 문서 (Documentation)

이 프로젝트의 상세 구현 과정과 설계 문서는 `Implementation` 디렉터리에 정리되어 있습니다.

*   [**RAG 워크플로우 상세 (v0.1)**](./Implementation/rag_workflow_v0.1.md)
*   [API 및 보안 구현 계획](./Implementation/09_secure_username_plan.md)
*   [UI/UX 개선 계획](./Implementation/01_ui_improvements_plan.md)

---
© 2024-2026 Studying Vibe Project. All Rights Reserved.
