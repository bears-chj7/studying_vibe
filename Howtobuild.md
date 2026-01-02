# 프로젝트 빌드 및 실행 가이드: 'Studying Vibe'

이 문서는 'Studying Vibe' 애플리케이션을 처음부터 설정하고, 빌드하며, 실행하는 방법에 대한 상세 가이드를 제공합니다. 이 프로젝트는 React 프론트엔드와 RAG (검색 증강 생성) 기능을 갖춘 Flask 백엔드로 구성되어 있습니다.

## 1. 전제 조건 (Prerequisites)

시작하기 전에, 시스템에 다음 소프트웨어들이 설치되어 있어야 합니다. 이 가이드는 리눅스 환경(예: Ubuntu/Debian)을 기준으로 작성되었습니다.

### 시스템 패키지
PDF 처리(OCR) 및 Python 컴파일을 위해 필요한 시스템 수준의 의존성 패키지들입니다.

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm mariadb-server libmysqlclient-dev poppler-utils tesseract-ocr tesseract-ocr-kor tesseract-ocr-eng
```

*   **python3**: 백엔드 실행을 위해 필요합니다.
*   **nodejs & npm**: 프론트엔드 실행을 위해 필요합니다.
*   **mariadb-server**: 사용자 정보 및 문서 메타데이터 저장을 위한 데이터베이스입니다.
*   **poppler-utils**: PDF 페이지를 이미지로 변환하기 위해 필요합니다 (OCR 전처리).
*   **tesseract-ocr**: 이미지에서 텍스트를 추출하기 위해 필요합니다 (한글 지원).

### 외부 서비스
1.  **Ollama**: 로컬 LLM 모델(`llama3.2:1b`) 실행을 위해 사용됩니다.
    *   설치: [ollama.com의 안내](https://ollama.com)를 따르세요.
    *   모델 다운로드:
        ```bash
        ollama pull llama3.2:1b
        ```
    *   Ollama 서비스가 11434 포트에서 실행 중이어야 합니다.

2.  **Google Gemini API 키** (선택 사항이지만 성능 향상을 위해 권장):
    *   Google AI Studio에서 API 키를 발급받으세요.

## 2. 프로젝트 구조

프로젝트는 다음과 같이 구성되어 있습니다:

```
studying_vibe/
├── backend/            # Flask 백엔드
│   ├── app.py          # 메인 애플리케이션 진입점
│   ├── auth_middleware.py # ABAC 권한 검사 미들웨어
│   ├── database.py     # 데이터베이스 연결 로직
│   ├── rag.py          # RAG 서비스 (ChromaDB, OCR, 임베딩)
│   ├── init_db.py      # 데이터베이스 초기화 스크립트
│   └── requirements.txt
├── frontend/           # React 프론트엔드
│   ├── src/            # 소스 코드 (React Components)
│   ├── package.json
│   └── vite.config.js
└── env/                # 설정 디렉토리 (키 파일 등)
```

## 3. 데이터베이스 설정 (MariaDB)

1.  **MariaDB 시작 및 보안 설정**:
    ```bash
    sudo systemctl start mariadb
    sudo mysql_secure_installation
    ```

2.  **데이터베이스 및 사용자 생성**:
    MySQL 쉘에 로그인(`sudo mysql -u root -p`)한 후 다음 명령어를 실행하세요:

    ```sql
    CREATE DATABASE studying_vibe_db;
    CREATE USER 'vibe_user'@'localhost' IDENTIFIED BY 'vibe_password';
    GRANT ALL PRIVILEGES ON studying_vibe_db.* TO 'vibe_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

## 4. 백엔드 설정

1.  **백엔드 디렉토리로 이동**:
    ```bash
    cd backend
    ```

2.  **가상 환경 생성 및 활성화**:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  **Python 의존성 패키지 설치**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **환경 변수 설정**:
    `backend/` 디렉토리 안에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

    ```ini
    DB_HOST=localhost
    DB_NAME=studying_vibe_db
    DB_USER=vibe_user
    DB_PASSWORD=vibe_password
    ```

5.  **Gemini API 키 설정**:
    *   백엔드 디렉터리 기준 상위 폴더인 `../env/gemini.key` (프로젝트 루트의 `env/gemini.key`) 파일 위치에 키를 저장합니다.
    *   해당 파일에 Google Gemini API 키를 붙여넣으세요 (공백 없이 키 값만 입력).

6.  **참고: ABAC 권한 마이그레이션**:
    기본 테이블 생성 후 사용자 권한(속성 기반)을 설정하기 위해 별도의 마이그레이션 스크립트가 있을 수 있습니다. (예: `migrate_abac_v2.py`)

7.  **백엔드 서버 실행**:
    ```bash
    python init_db.py  # 초기화
    python app.py      # 실행
    ```

## 5. 프론트엔드 설정

1.  **새 터미널 열기** 후 프론트엔드 디렉토리로 이동:
    ```bash
    cd frontend
    ```

2.  **Node 의존성 패키지 설치**:
    ```bash
    npm install
    ```
    *   주요 라이브러리: `react`, `vite`, `react-markdown` (마크다운 렌더링), `react-i18next` (다국어 지원).

3.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```

## 6. 주요 구현 기술 및 아키텍처 (Key Technical Implementations)

소스 코드 내에 구현된 주요 기술적 특징들과 아키텍처 설명입니다.

### 6.1. 보안 및 접근 제어 (ABAC)
*   **개념**: RBAC(Role-Based) 대신 **ABAC(Attribute-Based Access Control)**을 사용하여 더 유연한 권한 관리를 구현했습니다.
*   **구현**: `backend/auth_middleware.py`의 `check_abac` 데코레이터를 사용합니다.
*   **동작 방식**: 사용자의 특정 속성(User Attributes)을 DB(`user_attributes` 테이블)에서 조회하여 API 접근을 제어합니다.
    *   예: `@check_abac({'access_page': 'documents'})` -> 사용자가 `access_page: documents` 속성을 가져야만 접근 가능.

### 6.2. RAG (검색 증강 생성) 파이프라인
*   **구조**: `backend/rag.py`에 구현되어 있습니다.
*   **OCR 폴백(Fallback)**: PDF 파일에서 텍스트 추출(`PyPDFLoader`)을 시도하고, 텍스트가 없거나 너무 적을 경우(이미지 파일 등) 자동으로 `pdf2image`와 `pytesseract`를 사용하여 OCR을 수행합니다. 다국어(한국어+영어) 인식을 지원합니다.
*   **멱등성(Idempotency)**: 문서를 재업로드하거나 설정을 변경하여 다시 처리(Re-ingest)할 때, 기존 벡터 청크를 먼저 삭제(`delete_file`)하여 데이터 중복을 방지합니다.

### 6.3. 실시간 스트리밍 응답 (Real-time Streaming)
*   **적용**: 문서 업로드 및 일괄 재처리 시 진행 상황을 사용자에게 실시간으로 보여주기 위해 적용되었습니다.
*   **기술**: HTTP Streaming Response와 **NDJSON (Newline Delimited JSON)** 형식을 사용합니다.
*   **소스**: `backend/blueprints/documents.py`에서 `Response(generate(), mimetype='application/x-ndjson')` 형태로 제너레이터를 반환합니다. 프론트엔드(`DocumentManager.jsx`)에서는 `ReadableStream`을 통해 청크 단위로 데이터를 읽어 UI의 로그창에 즉시 반영합니다.

### 6.4. 채팅 저장 및 보안 정책
*   **스토리지 전략**: 보안을 위해 채팅 기록을 서버 DB에 영구 저장하지 않습니다.
    *   **localStorage** 대신 **SessionStorage**를 사용합니다. 브라우저/탭 종료 시 데이터가 자동 소멸됩니다 (`useEffect` in `Chat.jsx`).
    *   **로그인/로그아웃 트리거**: `App.jsx`의 `handleLogin` 및 `handleLogout`에서 세션 스토리지를 명시적으로 초기화하여, 공용 PC 등에서의 정보 유출을 방지합니다.
*   **렌더링**: `react-markdown`과 `remark-gfm`을 사용하여 LLM의 마크다운 응답(표, 코드 블록, 볼드체 등)을 깔끔하게 렌더링합니다.

### 6.5. 다국어 지원 (i18n)
*   **구현**: `react-i18next`를 사용하여 한/영 전환을 지원합니다.
*   **리소스**: `frontend/src/locales/` 디렉토리에 JSON 파일로 분리되어 관리됩니다.

## 7. 사용 방법

1.  **애플리케이션 접속**: `http://localhost:5173`
2.  **로그인**: 계정 생성 후 로그인. (Chat History는 매 로그인 시 초기화됨)
3.  **문서 관리**: PDF 업로드 -> 실시간 진행 로그 확인 -> 벡터 DB(ChromaDB) 자동 저장.
4.  **채팅**: 문서 기반 질의응답. "새로 시작" 버튼으로 대화 리셋 가능.

## 8. 문제 해결 (Troubleshooting)

*   **Ollama 연결 오류**: `ollama serve` 실행 여부 확인.
*   **ABAC 권한 오류**: `user_attributes` 테이블에 사용자 권한이 올바르게 매핑되어 있는지 확인. (필요 시 `init_db.py`의 시드 데이터 확인)
