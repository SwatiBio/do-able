import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_task(client: AsyncClient):
    resp = await client.post("/api/tasks", json={"title": "Buy milk", "priority": "high"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Buy milk"
    assert data["priority"] == "high"
    assert data["status"] == "not_started"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_tasks(client: AsyncClient):
    await client.post("/api/tasks", json={"title": "Task 1"})
    await client.post("/api/tasks", json={"title": "Task 2"})
    resp = await client.get("/api/tasks")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2
    assert len(data["tasks"]) >= 2


@pytest.mark.asyncio
async def test_get_task(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Get me"})
    tid = create.json()["id"]
    resp = await client.get(f"/api/tasks/{tid}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Get me"


@pytest.mark.asyncio
async def test_update_task(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Update me"})
    tid = create.json()["id"]
    resp = await client.put(f"/api/tasks/{tid}", json={"title": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated"


@pytest.mark.asyncio
async def test_delete_task(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Delete me"})
    tid = create.json()["id"]
    resp = await client.delete(f"/api/tasks/{tid}")
    assert resp.status_code == 204
    get_resp = await client.get(f"/api/tasks/{tid}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_mark_done(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Done task"})
    tid = create.json()["id"]
    resp = await client.post(f"/api/tasks/{tid}/done")
    assert resp.status_code == 200
    assert resp.json()["task"]["status"] == "done"


@pytest.mark.asyncio
async def test_mark_undone(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Undone task"})
    tid = create.json()["id"]
    await client.post(f"/api/tasks/{tid}/done")
    resp = await client.post(f"/api/tasks/{tid}/undone")
    assert resp.status_code == 200
    assert resp.json()["status"] == "not_started"


@pytest.mark.asyncio
async def test_add_note(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Noted task"})
    tid = create.json()["id"]
    resp = await client.post(f"/api/tasks/{tid}/note", json={"text": "A note"})
    assert resp.status_code == 201
    assert resp.json()["text"] == "A note"


@pytest.mark.asyncio
async def test_search_tasks(client: AsyncClient):
    await client.post("/api/tasks", json={"title": "Find this one"})
    resp = await client.get("/api/search?q=Find")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.asyncio
async def test_recurring_task(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Recurring", "due_date": "2026-06-21", "recur": "daily"})
    tid = create.json()["id"]
    resp = await client.post(f"/api/tasks/{tid}/done")
    assert resp.status_code == 200
    assert resp.json()["task"]["status"] == "done"
    assert resp.json()["recurrence"] is not None
    assert resp.json()["recurrence"]["due_date"] == "2026-06-22"
