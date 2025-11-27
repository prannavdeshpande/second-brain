import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Import the processing logic
from ingest import process_and_store
from url_handler import extract_text_from_url, extract_media_from_url

import requests
from bs4 import BeautifulSoup
from langchain.docstore.document import Document
import pytesseract
from PIL import Image
from io import BytesIO

HEADERS = {"User-Agent": "Mozilla/5.0"}

# LangChain components for the query part
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.vectorstores import Chroma
from langchain.embeddings import SentenceTransformerEmbeddings

# Load environment variables from .env file
load_dotenv()

# --- Configuration & Initialization ---
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

# Use the same embedding function as ingest.py
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

vector_db = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embedding_function
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.1
)

# The main RAG chain with source documents
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_db.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True
)

# --- FastAPI App ---
app = FastAPI(
    title="Second Brain API",
    description="API for document ingestion and intelligent querying with support for files, URLs, and social media",
    version="2.0.0"
)

@app.post("/upload/")
async def upload_file(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None)
):
    """
    Endpoint to upload a file or URL for processing and indexing.
    
    Supports:
    - Files: PDF, DOCX, TXT, MD, Images (JPG, PNG, etc.), Audio/Video (MP3, MP4, etc.)
    - URLs: Regular web pages, YouTube videos, Twitter/X posts, Instagram posts
    
    Either 'file' or 'url' must be provided, but not both.
    """
    # Validate input: must provide either file or url, but not both
    if file is None and url is None:
        return JSONResponse(
            status_code=400,
            content={"message": "Either 'file' or 'url' must be provided."}
        )
    
    if file is not None and url is not None:
        return JSONResponse(
            status_code=400,
            content={"message": "Please provide either 'file' or 'url', not both."}
        )
    
    temp_dir = "temp_files"
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Handle URL input
        if url:
            print(f"\n{'='*60}")
            print(f"Processing URL: {url}")
            print(f"{'='*60}")
            
            # Extract text from URL using the enhanced function from url_handler.py
            # Automatically handles YouTube, Instagram, Twitter, and regular URLs
            documents = extract_text_from_url(url)
            print("\n\n=======================URL_CONTENT==================================\n")
            print(documents)
            print("\n\n=======================URL_CONTENT==================================\n\n\n\n")
            if not documents:
                return JSONResponse(
                    status_code=400,
                    content={"message": "Could not extract content from URL"}
                )
            
            print(f"Extracted {len(documents)} document(s) from URL")
            
            # Extract media (images with OCR) for regular web pages
            # Social media platforms handle media in their specific extractors
            media = extract_media_from_url(url)

            if isinstance(media, dict):
                # Add OCR documents from images found on the page
                ocr_docs = media.get("ocr_docs", [])
                if ocr_docs:
                    documents.extend(ocr_docs)
                    print(f"Added {len(ocr_docs)} OCR documents from images")

            # Add metadata to all documents
            for doc in documents:
                if "source" not in doc.metadata:
                    doc.metadata["source"] = url
                if "filename" not in doc.metadata:
                    doc.metadata["filename"] = url
                if "file_type" not in doc.metadata:
                    doc.metadata["file_type"] = "url"
            
            # Split and store documents
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, 
                chunk_overlap=200,
                length_function=len,
                add_start_index=True,
            )
            chunks = text_splitter.split_documents(documents)
            print(f"Split URL content into {len(chunks)} chunks.")
            
            # Verify metadata in chunks
            for chunk in chunks:
                if "source" not in chunk.metadata:
                    chunk.metadata["source"] = url
                if "filename" not in chunk.metadata:
                    chunk.metadata["filename"] = url
                if "file_type" not in chunk.metadata:
                    chunk.metadata["file_type"] = "url"
            
            # Store in vector database (auto-persisted in Chroma 0.4+)
            vector_db.add_documents(chunks)
            
            # Determine content type from metadata
            content_type = documents[0].metadata.get("type", "url") if documents else "url"
            
            print(f"✅ Successfully processed URL: {url}")
            print(f"{'='*60}\n")
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": f"URL '{url}' processed successfully.",
                    "source": url,
                    "type": content_type,
                    "chunks": len(chunks),
                    "num_documents": len(documents),
                    "num_images_processed": len(media.get("ocr_docs", [])) if isinstance(media, dict) else 0
                }
            )
        
        # Handle file upload
        else:
            print(f"\n{'='*60}")
            print(f"Processing File: {file.filename}")
            print(f"{'='*60}")
            
            file_path = os.path.join(temp_dir, file.filename)
            
            # Save uploaded file temporarily
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            print(f"File saved temporarily: {file_path}")
            
            # Trigger the ingestion process
            s3_url = process_and_store(file_path, file.filename)
            
            print(f"✅ Successfully processed file: {file.filename}")
            print(f"{'='*60}\n")
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": f"File '{file.filename}' processed successfully.",
                    "s3_path": s3_url,
                    "filename": file.filename,
                    "type": "file"
                }
            )
            
    except Exception as e:
        print(f"❌ Error in upload endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}"}
        )
    finally:
        # Clean up temporary file if it exists
        if file and 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🧹 Cleaned up temporary file: {file_path}")
            except Exception as e:
                print(f"⚠️  Warning: Could not remove temporary file: {e}")

@app.post("/query/")
async def query_model(query: str = Form(...)):
    """
    Endpoint to ask a question and get an answer from the indexed documents.
    
    Returns:
    - answer: The generated answer from the AI
    - sources: List of source documents that were used to generate the answer
    - num_sources: Number of unique sources referenced
    """
    try:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"{'='*60}")
        
        # Execute the QA chain
        result = qa_chain({"query": query})
        answer = result.get("result")
        source_documents = result.get("source_documents", [])
        
        print(f"Found {len(source_documents)} relevant document chunks")
        
        # Extract unique S3 paths and filenames from source documents
        sources_info = []
        seen_paths = set()
        
        for doc in source_documents:
            s3_path = doc.metadata.get("s3_path", None)
            filename = doc.metadata.get("filename", "Unknown")
            file_type = doc.metadata.get("file_type", "Unknown")
            source = doc.metadata.get("source", "Unknown")
            doc_type = doc.metadata.get("type", "unknown")
            
            # Use source as identifier for URLs, s3_path for files
            identifier = s3_path if s3_path else source
            
            if identifier and identifier not in seen_paths:
                sources_info.append({
                    "s3_path": s3_path,
                    "filename": filename,
                    "file_type": file_type,
                    "source": source,
                    "content_type": doc_type
                })
                seen_paths.add(identifier)
        
        print(f"Answer generated from {len(sources_info)} unique sources")
        print(f"{'='*60}\n")
        
        return JSONResponse(
            status_code=200,
            content={
                "answer": answer,
                "sources": sources_info,
                "num_sources": len(sources_info)
            }
        )
    except Exception as e:
        print(f"❌ Error in query endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}"}
        )

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Second Brain API is running",
        "status": "healthy",
        "version": "2.0.0",
        "supported_platforms": [
            "Files (PDF, DOCX, TXT, MD, Images, Audio, Video)",
            "YouTube Videos (with transcripts)",
            "Twitter/X Posts",
            "Instagram Posts",
            "Regular Web Pages"
        ]
    }

@app.get("/stats/")
async def get_stats():
    """Get statistics about the vector database."""
    try:
        # Get collection info
        collection = vector_db._collection
        count = collection.count()
        
        return JSONResponse(
            status_code=200,
            content={
                "total_documents": count,
                "database_path": "./chroma_db",
                "embedding_model": "all-MiniLM-L6-v2",
                "llm_model": "gemini-2.5-flash"
            }
        )
    except Exception as e:
        print(f"❌ Error in stats endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}"}
        )

@app.delete("/clear/")
async def clear_database():
    """
    Clear all documents from the vector database.
    WARNING: This action cannot be undone!
    """
    try:
        # Get collection and delete all documents
        collection = vector_db._collection
        count = collection.count()
        
        # Delete all documents
        collection.delete(where={})
        # Auto-persisted in Chroma 0.4+
        
        print(f"🗑️  Cleared {count} documents from database")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Successfully cleared {count} documents from the database",
                "deleted_count": count
            }
        )
    except Exception as e:
        print(f"Error in clear endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}"}
        )

@app.get("/health/")
async def health_check():
    """Detailed health check with system status."""
    try:
        # Check vector database
        collection = vector_db._collection
        doc_count = collection.count()
        
        # Check if Google API key is set
        google_api_configured = bool(os.getenv("GOOGLE_API_KEY"))
        
        # Check if AWS is configured
        aws_configured = bool(os.getenv("AWS_ACCESS_KEY_ID")) and bool(os.getenv("AWS_SECRET_ACCESS_KEY"))
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "vector_db_status": "connected",
                "total_documents": doc_count,
                "google_api_configured": google_api_configured,
                "aws_s3_configured": aws_configured,
                "embedding_model": "all-MiniLM-L6-v2",
                "llm_model": "gemini-2.5-flash"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
