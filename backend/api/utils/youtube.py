import os
from urllib.parse import urlparse, parse_qs
import requests

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


def extract_video_id(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        return parsed.path.lstrip("/") or None
    if "youtube.com" in parsed.netloc:
        return parse_qs(parsed.query).get("v", [None])[0]
    return None


def extract_playlist_id(url: str) -> str | None:
    parsed = urlparse(url)
    return parse_qs(parsed.query).get("list", [None])[0]


def fetch_playlist_videos(playlist_url: str) -> list[dict]:
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY is not set")

    playlist_id = extract_playlist_id(playlist_url)
    if not playlist_id:
        raise ValueError("could not extract playlist ID from URL")

    videos = []
    next_page_token = None

    while True:
        params: dict = {
            "part": "snippet",
            "playlistId": playlist_id,
            "maxResults": 50,
            "key": api_key,
        }
        if next_page_token:
            params["pageToken"] = next_page_token

        response = requests.get(f"{YOUTUBE_API_BASE}/playlistItems", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        for item in data.get("items", []):
            snippet = item["snippet"]
            video_id = snippet["resourceId"]["videoId"]
            thumbnail = (
                snippet.get("thumbnails", {})
                .get("medium", {})
                .get("url", f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg")
            )
            videos.append({
                "youtubeId": video_id,
                "title": snippet["title"],
                "thumbnailUrl": thumbnail,
            })

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

    return videos
