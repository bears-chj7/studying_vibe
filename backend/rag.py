import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import shutil
import pdf2image
import pytesseract

class RAGService:
    def __init__(self, persist_directory="./chroma_db_v2"):
        self.persist_directory = persist_directory
        self.embedding_function = SentenceTransformerEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
        self.db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embedding_function)

    def ingest_file(self, file_path, chunk_size=1000, chunk_overlap=200):
        """Ingests a single PDF file with idempotent IDs. Yields progress updates."""
        if not file_path.endswith(".pdf"):
            yield {"status": "error", "message": "Not a PDF file"}
            return
            
        try:
            yield {"status": "info", "message": "Loading PDF file..."}
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            
            # Check if text was extracted. If totally empty or very short, try OCR.
            total_text_len = sum([len(doc.page_content.strip()) for doc in documents])
            
            if total_text_len < 50: # Threshold for "empty" or image-only PDF
                print(f"Low text content detected ({total_text_len} chars). Attempting OCR for {file_path}...")
                yield {"status": "info", "message": "Image-only PDF detected. Starting OCR..."}
                
                try:
                    images = pdf2image.convert_from_path(file_path)
                    total_pages = len(images)
                    documents = []
                    
                    for i, image in enumerate(images):
                        yield {"status": "info", "message": f"OCR Processing page {i+1}/{total_pages}..."}
                        # Extract text with Korean and English support
                        text = pytesseract.image_to_string(image, lang='kor+eng')
                        if text.strip():
                            documents.append(Document(page_content=text, metadata={"source": file_path, "page": i}))
                    
                    if not documents:
                        yield {"status": "error", "message": "No content found in PDF even with OCR"}
                        return
                        
                except Exception as ocr_e:
                    print(f"OCR Failed: {ocr_e}")
                    yield {"status": "error", "message": f"OCR Failed: {str(ocr_e)}"}
                    return

            yield {"status": "info", "message": f"Splitting text ({len(documents)} pages)..."}
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            chunks = text_splitter.split_documents(documents)
            
            yield {"status": "info", "message": f"Generated {len(chunks)} chunks. Indexing to Vector DB..."}
            
            # Generate unique IDs based on filename and chunk index to prevent duplicates
            filename = os.path.basename(file_path)
            ids = [f"{filename}_{i}" for i in range(len(chunks))]
            
            # Add metadata for deletion
            for chunk in chunks:
                chunk.metadata['source_file'] = filename
            
            # Clean up old chunks first to avoid ghosts
            self.delete_file(filename)
                
            self.db.add_documents(chunks, ids=ids)
            yield {"status": "success", "message": f"Ingested {len(chunks)} chunks from {filename}"}
            
        except Exception as e:
            yield {"status": "error", "message": str(e)}

    def delete_file(self, filename):
        """Removes documents associated with a specific file."""
        try:
            # chroma delete by metadata
            self.db._collection.delete(where={"source_file": filename})
            return True, f"Deleted content for {filename}"
        except Exception as e:
            return False, str(e)

    def get_chunks_by_filename(self, filename: str):
        """
        Retrieves all chunks for a specific file from the vector store.
        Returns a list of dicts with 'content' and 'metadata'.
        """
        try:
            results = self.db._collection.get(where={"source_file": filename})
            
            # Chroma 'get' returns: {'ids': [], 'embeddings': None, 'documents': [], 'metadatas': []}
            chunks = []
            if results['ids']:
                for i in range(len(results['ids'])):
                    chunks.append({
                        "id": results['ids'][i],
                        "content": results['documents'][i],
                        "metadata": results['metadatas'][i]
                    })
            return chunks
        except Exception as e:
            print(f"Error fetching chunks: {e}")
            return []

    def ingest_pdfs(self, pdf_directory):
        """(Legacy) Loads PDFs from the directory."""
        # Adapted to use new ingest_file for consistency
        results = []
        for filename in os.listdir(pdf_directory):
            if filename.endswith(".pdf"):
                file_path = os.path.join(pdf_directory, filename)
                success, msg = self.ingest_file(file_path)
                results.append(msg)
        return {"status": "success", "messages": results}

    def query(self, query_text, k=10):
        """Retrieves relevant context for the query."""
        results = self.db.similarity_search(query_text, k=k)
        return [doc.page_content for doc in results]

    def clear_db(self):
        """Clears the vector database."""
        if os.path.exists(self.persist_directory):
            shutil.rmtree(self.persist_directory)
            os.makedirs(self.persist_directory)
            # Re-init
            self.db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embedding_function)
