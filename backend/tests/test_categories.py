def test_list_categories_empty(client):
    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert response.get_json() == []


def test_create_category(client):
    response = client.post("/api/categories/", json={"name": "Math"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Math"


def test_create_category_missing_name(client):
    response = client.post("/api/categories/", json={})
    assert response.status_code == 400


def test_update_category(client):
    created = client.post("/api/categories/", json={"name": "Math"}).get_json()
    response = client.patch(f"/api/categories/{created['id']}", json={"name": "Calculus"})
    assert response.status_code == 200
    assert response.get_json()["name"] == "Calculus"


def test_delete_category(client):
    created = client.post("/api/categories/", json={"name": "Math"}).get_json()
    response = client.delete(f"/api/categories/{created['id']}")
    assert response.status_code == 204
    remaining = client.get("/api/categories/").get_json()
    assert remaining == []
