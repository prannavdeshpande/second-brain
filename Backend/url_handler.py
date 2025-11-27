import requests
from bs4 import BeautifulSoup
from langchain.docstore.document import Document
import pytesseract
from PIL import Image
from io import BytesIO
import re
from urllib.parse import urlparse, urljoin
import os
import tempfile

# Attempt to import the transcription function from ingest.py
try:
    from ingest import transcribe_audio_video
except ImportError:
    print("Warning: Could not import 'transcribe_audio_video' from 'ingest'. Video transcription will be disabled.")
    def transcribe_audio_video(file_path):
        return [Document(page_content="Error: Transcription module not loaded.")]

# --- Configuration ---
HEADERS = {"User-Agent": "Mozilla/5.0"}

# --- URL Type Checkers ---
def is_youtube_url(url: str) -> bool:
    """Check if URL is a YouTube link."""
    patterns = [
        r'(https?://)?(www\.)?(youtube\.com|youtu\.be)',
        r'youtube\.com/watch\?v=',
        r'youtu\.be/'
    ]
    return any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)

def is_twitter_url(url: str) -> bool:
    """Check if URL is a Twitter/X link."""
    patterns = [r'(https?://)?(www\.)?(twitter\.com|x\.com)']
    return any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)

def is_instagram_url(url: str) -> bool:
    """Check if URL is an Instagram link."""
    return re.search(r'(https?://)?(www\.)?instagram\.com', url, re.IGNORECASE) is not None

# --- OCR and Media Helper Functions ---
def ocr_from_image_url(img_url: str):
    """Download image from a URL and run OCR."""
    try:
        resp = requests.get(img_url, timeout=15, headers=HEADERS)
        resp.raise_for_status()
        # Handle different image formats like .webp
        img = Image.open(BytesIO(resp.content))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        text = pytesseract.image_to_string(img)
        if not text.strip():
            return None # Return None for no detected text
        print(f"✅ Successfully ran OCR on image: {img_url}")
        return text
    except Exception as e:
        print(f"❌ OCR failed for {img_url}: {e}")
        return None

def transcribe_video_from_url(video_url: str):
    """Download a video from a URL to a temp file and transcribe it."""
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            temp_path = tmp_file.name
            with requests.get(video_url, stream=True, timeout=60) as r:
                r.raise_for_status()
                for chunk in r.iter_content(chunk_size=8192):
                    tmp_file.write(chunk)
        
        print(f"Download complete. Transcribing from: {temp_path}")
        transcript_docs = transcribe_audio_video(temp_path)
        
        if transcript_docs and "Error" not in transcript_docs[0].page_content:
            print("✅ Successfully transcribed video.")
            return transcript_docs[0].page_content
        else:
            print("⚠️ Transcription failed or was empty.")
            return None
    except Exception as e:
        print(f"❌ Failed to download or process video for transcription: {e}")
        return None
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"🧹 Cleaned up temporary video file: {temp_path}")

# --- Platform-Specific Content Extractors ---
def extract_instagram_content(url: str):
    """
    Extracts content from Instagram, handling single posts and multi-media carousels.
    """
    documents = []
    API_HOST = "instagram-scraper-stable-api.p.rapidapi.com"
    API_URL = f"https://{API_HOST}/get_media_data_v2.php"
    API_KEY = "58618da25cmsh9a89ebd5dddb215p1fd3d2jsne9346e0c07be"
    
    try:
        media_code_match = re.search(r'/(p|reel)/([^/]+)', url)
        if not media_code_match:
            raise ValueError("Could not extract a valid media code from the Instagram URL.")
        media_code = media_code_match.group(2)

        headers = {"x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST}
        params = {"media_code": media_code}
        
        print(f"Querying Instagram API for media code: {media_code}")
        resp = requests.get(API_URL, headers=headers, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        author = data.get('owner', {}).get('username', 'Unknown Author')
        
        caption = "No caption found."
        try:
            caption_edges = data.get('edge_media_to_caption', {}).get('edges', [])
            if caption_edges:
                caption = caption_edges[0].get('node', {}).get('text', 'No caption found.')
        except (IndexError, AttributeError):
            caption = data.get('caption', {}).get('text', 'No caption found.')
        
        media_nodes = []
        if 'edge_sidecar_to_children' in data and data['edge_sidecar_to_children'].get('edges'):
            print(f"🎠 Carousel post detected. Processing {len(data['edge_sidecar_to_children']['edges'])} items...")
            media_nodes = [edge.get('node', {}) for edge in data['edge_sidecar_to_children']['edges']]
        else:
            print("ℹ️ Single media post detected.")
            media_nodes.append(data)

        combined_media_content = []
        for i, node in enumerate(media_nodes):
            item_num = i + 1
            is_video = node.get('is_video', False)
            
            if is_video:
                video_url = node.get('video_url')
                if video_url:
                    print(f"--- Processing Item {item_num} (Video) ---")
                    transcript = transcribe_video_from_url(video_url)
                    if transcript:
                        combined_media_content.append(f"--- Item {item_num} (Video Transcript) ---\n{transcript}")
            else:
                display_url = node.get('display_url')
                if display_url:
                    print(f"--- Processing Item {item_num} (Image) ---")
                    ocr_text = ocr_from_image_url(display_url)
                    if ocr_text:
                        combined_media_content.append(f"--- Item {item_num} (Image OCR) ---\n{ocr_text}")
        
        full_content = f"Author: @{author}\n\nCaption: {caption}"
        if combined_media_content:
            full_content += "\n\n" + "\n\n".join(combined_media_content)
        
        documents.append(Document(
            page_content=full_content,
            metadata={"source": url, "type": "instagram", "author": author}
        ))

    except Exception as e:
        print(f"❌ Failed to process Instagram URL: {e}")
        documents.append(Document(
            page_content=f"Error extracting Instagram content: {str(e)}",
            metadata={"source": url, "type": "instagram_error"}
        ))
        
    return documents

def extract_youtube_content(url: str):
    """Extracts transcript from a YouTube URL using RapidAPI."""
    try:
        video_id_match = re.search(r"(?:v=|youtu\.be/|embed/|watch\?v=)([A-Za-z0-9_\-]{11})", url)
        if not video_id_match:
            raise ValueError("Could not extract a valid YouTube video ID")
        
        video_id = video_id_match.group(1)
        api_url = "https://youtube-transcript3.p.rapidapi.com/api/transcript"
        headers = {
            "X-RapidAPI-Key": '58618da25cmsh9a89ebd5dddb215p1fd3d2jsne9346e0c07be',
            "X-RapidAPI-Host": "youtube-transcript3.p.rapidapi.com"
        }
        params = {"videoId": video_id}
        
        resp = requests.get(api_url, headers=headers, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        if not data or "transcript" not in data or not isinstance(data.get("transcript"), list):
            raise ValueError("Transcript not found or API returned an invalid format.")

        transcript_text = " ".join([item['text'] for item in data["transcript"] if 'text' in item])
        
        if not transcript_text.strip():
            return [Document(page_content="Transcript for this video is unavailable or empty.", metadata={"source": url, "type": "youtube_no_transcript"})]
        
        print(f"✅ Successfully extracted transcript for {url}")
        return [Document(page_content=transcript_text, metadata={"source": url, "type": "youtube"})]

    except Exception as e:
        print(f"❌ Error processing YouTube URL: {e}")
        return [Document(page_content=f"An unexpected error occurred while processing the YouTube URL: {str(e)}", metadata={"source": url, "type": "youtube_error"})]


def extract_twitter_content(url: str):
    """Extracts tweet content, replies, and OCR from images using a RapidAPI endpoint."""
    documents = []
    api_host = "twitter241.p.rapidapi.com"
    api_url = f"https://{api_host}/tweet"

    try:
        tweet_id_match = re.search(r'status/(\d+)', url)
        if not tweet_id_match:
            raise ValueError("Could not extract Tweet ID from URL")
        tweet_id = tweet_id_match.group(1)
        
        querystring = {"pid": tweet_id}
        headers = {
            "x-rapidapi-key": '58618da25cmsh9a89ebd5dddb215p1fd3d2jsne9346e0c07be',
            "x-rapidapi-host": api_host
        }
        
        print(f"Querying Twitter API for tweet ID: {tweet_id}")
        resp = requests.get(api_url, headers=headers, params=querystring, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        instructions = data.get('data', {}).get('threaded_conversation_with_injections_v2', {}).get('instructions', [])
        entries = next((inst.get('entries', []) for inst in instructions if inst.get('type') == 'TimelineAddEntries'), [])
        
        if not entries:
            raise ValueError("Could not find tweet entries in the API response.")

        for entry in entries:
            item_content = entry.get('content', {}).get('itemContent', {})
            if not item_content or item_content.get('itemType') != 'TimelineTweet':
                continue

            tweet_result = item_content.get('tweet_results', {}).get('result', {})
            if not tweet_result or tweet_result.get('__typename') != 'Tweet':
                continue
                
            legacy = tweet_result.get('legacy', {})
            if not legacy: continue

            user_results = tweet_result.get('core', {}).get('user_results', {}).get('result', {})
            author = user_results.get('legacy', {}).get('name', 'Unknown Author')
            screen_name = user_results.get('legacy', {}).get('screen_name', 'unknown')
            
            tweet_text = legacy.get('full_text', '')
            if not tweet_text.strip(): continue

            documents.append(Document(
                page_content=f"Author: {author} (@{screen_name})\n\nTweet: {tweet_text}",
                metadata={"source": url, "type": "twitter_thread_item", "author": author}
            ))

            for media_item in legacy.get('extended_entities', {}).get('media', []):
                if media_item.get('type') == 'photo' and (img_url := media_item.get('media_url_https')):
                    print(f"📸 Found Twitter image for OCR: {img_url}")
                    ocr_text = ocr_from_image_url(img_url)
                    if ocr_text:
                        documents.append(Document(
                            page_content=ocr_text, 
                            metadata={'parent_source': url, 'author': author, 'type': 'image_ocr'}
                        ))
        
        if not documents:
            documents.append(Document(page_content="No valid tweet content was found.", metadata={"source": url, "type": "twitter_error"}))

    except Exception as e:
        print(f"❌ Failed to extract Twitter content: {e}")
        documents.append(Document(page_content=f"Error extracting Twitter content: {str(e)}", metadata={"source": url, "type": "twitter_error"}))
        
    return documents

def extract_media_from_url(url: str):
    """
    Extract and process media (images) from regular web pages.
    """
    results = {"images": [], "ocr_docs": []}
    
    if is_youtube_url(url) or is_twitter_url(url) or is_instagram_url(url):
        return results 
    
    try:
        resp = requests.get(url, timeout=15, headers=HEADERS)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for img in soup.find_all("img"):
            src = img.get("src")
            if src:
                full_url = urljoin(url, src)
                
                width = img.get("width", "")
                height = img.get("height", "")
                try:
                    if (width and int(width) < 100) or (height and int(height) < 100):
                        continue
                except ValueError:
                    pass
                
                results["images"].append(full_url)
                
                if len(results["ocr_docs"]) < 5:
                    ocr_text = ocr_from_image_url(full_url)
                    if ocr_text:
                        results["ocr_docs"].append(Document(page_content=ocr_text, metadata={"source": full_url}))
        
        print(f"Extracted {len(results['images'])} images, performed OCR on up to 5.")
        return results
        
    except Exception as e:
        print(f"❌ Error extracting media from URL: {e}")
        return {"error": str(e), "images": [], "ocr_docs": []}

# --- Main URL Router ---
def extract_text_from_url(url: str):
    """
    Extract text from a URL, routing to the appropriate platform-specific function.
    """
    if is_youtube_url(url):
        print(f"▶️ Detected YouTube URL: {url}")
        return extract_youtube_content(url)
    
    elif is_twitter_url(url):
        print(f"🐦 Detected Twitter/X URL: {url}")
        return extract_twitter_content(url)
    
    elif is_instagram_url(url):
        print(f"📸 Detected Instagram URL: {url}")
        return extract_instagram_content(url)
    
    else:
        print(f"🌐 Using generic web scraping for: {url}")
        try:
            resp = requests.get(url, timeout=15, headers=HEADERS)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside"]):
                tag.decompose()
            text = " ".join(soup.stripped_strings)
            if not text.strip():
                text = "No text content could be extracted from this URL."
            return [Document(page_content=text, metadata={"source": url, "type": "url"})]
        except Exception as e:
            print(f"❌ Error extracting text from URL: {e}")
            return [Document(page_content=f"Error extracting text: {e}", metadata={"source": url, "type": "error"})]
