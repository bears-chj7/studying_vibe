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

    def ingest_pdfs(self, pdf_directory):
        """Loads PDFs from the directory, splits them, and adds to the vector store."""
        documents = []
        for filename in os.listdir(pdf_directory):
            if filename.endswith(".pdf"):
                file_path = os.path.join(pdf_directory, filename)
                try:
                    loader = PyPDFLoader(file_path)
                    documents.extend(loader.load())
                except Exception as e:
                    print(f"Error loading {filename}: {e}")

        if not documents:
            return {"status": "warning", "message": "No documents found or loaded."}

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        # Create new DB from documents (updating existing one)
        # using from_documents is easier but we might want to add.
        # calls self.db.add_documents if we want to append.
        
        self.db.add_documents(chunks)
        # self.db.persist() # Chroma 0.4+ persists automatically or needs explicit call depending on version, usually auto if path provided.
        
        return {"status": "success", "message": f"Ingested {len(documents)} documents into {len(chunks)} chunks."}

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
