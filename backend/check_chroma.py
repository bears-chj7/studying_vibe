import os
import sys
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

# Must match RAGService configuration
PERSIST_DIRECTORY = "./chroma_db"

def inspect_chroma():
    if not os.path.exists(PERSIST_DIRECTORY):
        print(f"Directory {PERSIST_DIRECTORY} does not exist.")
        return

    print(f"Inspecting ChromaDB at {PERSIST_DIRECTORY}...")
    
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embedding_function)
    
    # Get all ids (or count)
    # Chroma client access locally
    try:
        # For newer langchain_chroma / chromadb versions
        # Accessing the underlying collection
        collection = db._collection
        count = collection.count()
        print(f"Total documents in collection: {count}")
        
        if count > 0:
            # Peek at first 5 items
            peek = collection.peek(limit=5)
            print("\n--- Top 5 Documents ---")
            for i in range(len(peek['ids'])):
                print(f"\nID: {peek['ids'][i]}")
                print(f"Metadata: {peek['metadatas'][i]}")
                # Print first 200 chars of content
                content = peek['documents'][i]
                print(f"Content (first 200 chars): {content[:200]}...")
        else:
            print("Collection is empty.")

    except Exception as e:
        print(f"Error inspecting DB: {e}")

if __name__ == "__main__":
    inspect_chroma()
