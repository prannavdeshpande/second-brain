import os
import boto3
from langchain.document_loaders import PyPDFLoader, UnstructuredURLLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import Chroma
import pytesseract
from PIL import Image
from langchain.docstore.document import Document
from dotenv import load_dotenv

load_dotenv()

# --- AWS S3 Configuration ---
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "second-brain-bucket1")

# Try to initialize S3 client with explicit credentials first, fall back to default
try:
    if os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"):
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        print("Using AWS credentials from environment variables")
    else:
        s3_client = boto3.client('s3')
        print("Using default AWS credentials (AWS CLI or IAM role)")
except Exception as e:
    print(f"Warning: Could not initialize S3 client: {e}")
    s3_client = None

# --- Vector DB and Embeddings Configuration ---
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)

# --- Helper Functions for Data Extraction ---

def extract_text_from_pdf(file_path):
    loader = PyPDFLoader(file_path)
    return loader.load()

def extract_text_from_docx(file_path):
    loader = Docx2txtLoader(file_path)
    return loader.load()

def transcribe_audio_video(file_path):
    """
    Transcribe audio/video files using OpenAI Whisper.
    Falls back to a placeholder if Whisper is not available.
    """
    try:
        # Try to import and use whisper
        import whisper
        print(f"Transcribing audio/video file: {file_path}")
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        return [Document(page_content=result["text"])]
    except ImportError as e:
        print(f"Whisper not available: {e}")
        # Alternative: Return a placeholder
        return [Document(
            page_content=f"Audio/Video file uploaded but transcription not available. "
                        f"Please install openai-whisper: pip install openai-whisper"
        )]
    except Exception as e:
        print(f"Error transcribing audio/video: {e}")
        return [Document(
            page_content=f"Error transcribing audio/video file: {str(e)}"
        )]

def ocr_image(file_path):
    try:
        text = pytesseract.image_to_string(Image.open(file_path))
        if not text.strip():
            text = "Image uploaded but no text detected."
        return [Document(page_content=text)]
    except Exception as e:
        print(f"Error performing OCR: {e}")
        return [Document(page_content=f"Error performing OCR: {str(e)}")]

def get_documents_from_file(file_path, file_type, url=None):
    """Selects the correct document loader based on file type."""
    if file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        return extract_text_from_docx(file_path)
    elif file_type in ['mp3', 'mp4', 'wav', 'm4a', 'flac', 'ogg']:
        return transcribe_audio_video(file_path)
    elif file_type in ['jpg', 'png', 'jpeg', 'gif', 'bmp', 'tiff']:
        return ocr_image(file_path)
    elif file_type in ['txt', 'md']:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            return [Document(page_content=text)]
    else:
        print(f"Unsupported file type: {file_type}")
        return None

# --- Main Ingestion Logic ---

def process_and_store(file_path, original_filename):
    """
    The main function to process a file and store it in S3 and Vector DB.
    """
    print(f"Starting processing for: {original_filename}")

    # 1. Upload original file to S3
    s3_url = None
    s3_object_key = f"originals/{original_filename}"
    
    if s3_client:
        try:
            s3_client.upload_file(file_path, S3_BUCKET_NAME, s3_object_key)
            s3_url = f"s3://{S3_BUCKET_NAME}/{s3_object_key}"
            print(f"Successfully uploaded {original_filename} to {s3_url}")
        except Exception as e:
            print(f"Error uploading to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    else:
        print("Warning: S3 client not initialized. Skipping S3 upload.")
        s3_url = f"local://originals/{original_filename}"

    # 2. Extract text from the document
    file_extension = original_filename.split('.')[-1].lower()
    documents = get_documents_from_file(file_path, file_extension)

    if not documents:
        raise Exception("Could not extract text from document")

    # 3. Add comprehensive metadata to each document BEFORE splitting
    for doc in documents:
        doc.metadata["s3_path"] = s3_url
        doc.metadata["filename"] = original_filename
        doc.metadata["file_type"] = file_extension
        if "source" not in doc.metadata:
            doc.metadata["source"] = original_filename

    # 4. Split document into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split document into {len(chunks)} chunks.")

    # 5. Verify metadata is preserved in chunks
    for chunk in chunks:
        if "s3_path" not in chunk.metadata:
            chunk.metadata["s3_path"] = s3_url
            chunk.metadata["filename"] = original_filename
            chunk.metadata["file_type"] = file_extension

    # 6. Embed chunks and store in Vector DB
    vector_db.add_documents(chunks)
    vector_db.persist()
    print(f"Successfully added {len(chunks)} chunks to the vector database with S3 path: {s3_url}")
    
    return s3_url
