import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_template(client: AsyncClient):
    resp = await client.post("/api/templates", json={
        "name": "Morning routine",
        "title": "Drink coffee",
        "priority": "high",
        "tags": ["health", "daily"],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Morning routine"
    assert data["title"] == "Drink coffee"
    assert data["priority"] == "high"
    assert data["tags"] == ["health", "daily"]
    assert "id" in data


@pytest.mark.asyncio
async def test_list_templates(client: AsyncClient):
    await client.post("/api/templates", json={"name": "Template A", "title": "A"})
    await client.post("/api/templates", json={"name": "Template B", "title": "B"})
    resp = await client.get("/api/templates")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["templates"]) >= 2


@pytest.mark.asyncio
async def test_update_template(client: AsyncClient):
    create = await client.post("/api/templates", json={"name": "Old name", "title": "Old title"})
    tid = create.json()["id"]
    resp = await client.put(f"/api/templates/{tid}", json={"name": "New name", "title": "New title"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New name"
    assert resp.json()["title"] == "New title"


@pytest.mark.asyncio
async def test_delete_template(client: AsyncClient):
    create = await client.post("/api/templates", json={"name": "Delete me", "title": "Bye"})
    tid = create.json()["id"]
    resp = await client.delete(f"/api/templates/{tid}")
    assert resp.status_code == 204
    list_resp = await client.get("/api/templates")
    names = [t["name"] for t in list_resp.json()["templates"]]
    assert "Delete me" not in names


@pytest.mark.asyncio
async def test_sync_templates(client: AsyncClient):
    resp = await client.post("/api/sync/full", json={
        "tasks": [],
        "notes": [],
        "config": {},
        "templates": [
            {"name": "Synced template", "title": "Synced task", "priority": "high", "tags": ["sync"]},
            {"name": "Another", "title": "Another task", "category": "Work"},
        ],
    })
    assert resp.status_code == 200
    list_resp = await client.get("/api/templates")
    templates = list_resp.json()["templates"]
    assert len(templates) == 2
    names = [t["name"] for t in templates]
    assert "Synced template" in names
    assert "Another" in names
    synced = next(t for t in templates if t["name"] == "Synced template")
    assert synced["tags"] == ["sync"]
    assert synced["priority"] == "high"
