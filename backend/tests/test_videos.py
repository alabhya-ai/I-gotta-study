def _make_category(client):
    return client.post("/api/categories/", json={"name": "Test"}).get_json()


def test_list_videos_empty(client):
    category = _make_category(client)
    response = client.get(f"/api/categories/{category['id']}/videos")
    assert response.status_code == 200
    assert response.get_json() == []


def test_add_video(client):
    category = _make_category(client)
    response = client.post(
        f"/api/categories/{category['id']}/videos",
        json={"url": "https://youtu.be/dQw4w9WgXcQ", "title": "Rick Roll"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["youtubeId"] == "dQw4w9WgXcQ"
    assert data["title"] == "Rick Roll"


def test_add_video_bad_url(client):
    category = _make_category(client)
    response = client.post(
        f"/api/categories/{category['id']}/videos",
        json={"url": "not-a-youtube-url"},
    )
    assert response.status_code == 400


def test_delete_video(client):
    category = _make_category(client)
    video = client.post(
        f"/api/categories/{category['id']}/videos",
        json={"url": "https://youtu.be/dQw4w9WgXcQ"},
    ).get_json()
    response = client.delete(f"/api/videos/{video['id']}")
    assert response.status_code == 204
