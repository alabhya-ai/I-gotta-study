def _make_category(client):
    return client.post("/api/categories/", json={"name": "Test"}).get_json()


def test_list_resources_empty(client):
    category = _make_category(client)
    response = client.get(f"/api/categories/{category['id']}/resources")
    assert response.status_code == 200
    assert response.get_json() == []


def test_add_resource(client):
    category = _make_category(client)
    response = client.post(
        f"/api/categories/{category['id']}/resources",
        json={"title": "Syllabus", "url": "https://example.com/syllabus.pdf", "resourceType": "url"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == "Syllabus"
    assert data["resourceType"] == "url"


def test_add_resource_missing_title(client):
    category = _make_category(client)
    response = client.post(
        f"/api/categories/{category['id']}/resources",
        json={"url": "https://example.com", "resourceType": "url"},
    )
    assert response.status_code == 400


def test_add_resource_bad_type(client):
    category = _make_category(client)
    response = client.post(
        f"/api/categories/{category['id']}/resources",
        json={"title": "Test", "url": "https://example.com", "resourceType": "invalid"},
    )
    assert response.status_code == 400


def test_delete_resource(client):
    category = _make_category(client)
    resource = client.post(
        f"/api/categories/{category['id']}/resources",
        json={"title": "Syllabus", "url": "https://example.com", "resourceType": "file"},
    ).get_json()
    response = client.delete(f"/api/resources/{resource['id']}")
    assert response.status_code == 204
