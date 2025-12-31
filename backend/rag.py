import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import shutil

class RAGService:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        self.db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embedding_function)

    def ingest_file(self, file_path):
        """Ingests a single PDF file with idempotent IDs."""
        if not file_path.endswith(".pdf"):
            return False, "Not a PDF file"
            
        try:
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            
            if not documents:
                return False, "No content found in PDF"

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = text_splitter.split_documents(documents)
            
            # Generate unique IDs based on filename and chunk index to prevent duplicates
            filename = os.path.basename(file_path)
            ids = [f"{filename}_{i}" for i in range(len(chunks))]
            
            # Add metadata for deletion
            for chunk in chunks:
                chunk.metadata['source_file'] = filename
                
            self.db.add_documents(chunks, ids=ids)
            return True, f"Ingested {len(chunks)} chunks from {filename}"
            
        except Exception as e:
            return False, str(e)

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

    def query(self, query_text, k=3):
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
