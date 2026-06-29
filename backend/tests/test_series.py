import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_series(client: AsyncClient):
    resp = await client.post("/api/series", json={
        "title": "Daily standup",
        "recur": "daily",
        "priority": "medium",
        "category": "Meetings",
        "tags": ["team"],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Daily standup"
    assert data["recur"] == "daily"
    assert data["active"] is True
    assert data["tags"] == ["team"]
    assert "id" in data


@pytest.mark.asyncio
async def test_list_series(client: AsyncClient):
    await client.post("/api/series", json={"title": "Series A", "recur": "weekly"})
    await client.post("/api/series", json={"title": "Series B", "recur": "daily"})
    resp = await client.get("/api/series")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["series"]) >= 2


@pytest.mark.asyncio
async def test_update_series(client: AsyncClient):
    create = await client.post("/api/series", json={"title": "Old", "recur": "daily"})
    sid = create.json()["id"]
    resp = await client.put(f"/api/series/{sid}", json={"title": "Updated title", "priority": "high"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated title"
    assert resp.json()["priority"] == "high"


@pytest.mark.asyncio
async def test_stop_series(client: AsyncClient):
    create = await client.post("/api/series", json={"title": "Stop me", "recur": "daily"})
    sid = create.json()["id"]
    assert create.json()["active"] is True
    resp = await client.post(f"/api/series/{sid}/stop")
    assert resp.status_code == 200
    assert resp.json()["active"] is False


@pytest.mark.asyncio
async def test_delete_series(client: AsyncClient):
    create = await client.post("/api/series", json={"title": "Delete me", "recur": "daily"})
    sid = create.json()["id"]
    resp = await client.delete(f"/api/series/{sid}")
    assert resp.status_code == 204
    list_resp = await client.get("/api/series")
    titles = [s["title"] for s in list_resp.json()["series"]]
    assert "Delete me" not in titles


@pytest.mark.asyncio
async def test_series_with_task_mapping(client: AsyncClient):
    create_resp = await client.post("/api/series", json={"title": "Test series", "recur": "weekly", "priority": "high", "tags": ["sync"]})
    assert create_resp.status_code == 201
    series_id = create_resp.json()["id"]
    assert series_id is not None

    task_resp = await client.post("/api/tasks", json={
        "title": "Recurring task",
        "status": "not_started",
        "priority": "medium",
        "recur": "weekly",
        "series_id": series_id,
    })
    assert task_resp.status_code == 201
    task = task_resp.json()
    assert task["series_id"] == series_id


@pytest.mark.asyncio
async def test_series_with_files(client: AsyncClient):
    resp = await client.post("/api/series", json={
        "title": "Series with files",
        "recur": "daily",
        "files": [{"name": "checklist.txt", "data": "aGVsbG8=", "size": 5, "type": "text/plain"}],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert len(data["files"]) == 1
    assert data["files"][0]["name"] == "checklist.txt"
