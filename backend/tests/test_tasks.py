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
async def test_add_annotation(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Annotated task"})
    tid = create.json()["id"]
    resp = await client.post(f"/api/tasks/{tid}/annotation", json={"text": "An annotation"})
    assert resp.status_code == 201
    assert resp.json()["text"] == "An annotation"


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


@pytest.mark.asyncio
async def test_cancel_task(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Cancel me"})
    tid = create.json()["id"]
    resp = await client.put(f"/api/tasks/{tid}", json={"status": "cancelled"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_in_progress_status(client: AsyncClient):
    create = await client.post("/api/tasks", json={"title": "Working on it"})
    tid = create.json()["id"]
    resp = await client.put(f"/api/tasks/{tid}", json={"status": "in_progress"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_progress"


@pytest.mark.asyncio
async def test_hard_delete_logs_on_dependents(client: AsyncClient):
    dep_create = await client.post("/api/tasks", json={"title": "Foundation"})
    dep_id = dep_create.json()["id"]
    dep_create2 = await client.post("/api/tasks", json={"title": "Dependent", "depends_on": [dep_id]})
    dependent_id = dep_create2.json()["id"]
    await client.delete(f"/api/tasks/{dep_id}")
    resp = await client.delete(f"/api/bin/{dep_id}")
    assert resp.status_code == 204
    bin_resp = await client.get("/api/bin")
    assert all(t["id"] != dep_id for t in bin_resp.json()["tasks"])
    act_resp = await client.get(f"/api/activity?task_id={dependent_id}&action=dependency_removed")
    actions = act_resp.json()["entries"]
    assert len(actions) >= 1
    assert actions[0]["details"] == "Foundation"


@pytest.mark.asyncio
async def test_config_category_colors(client: AsyncClient):
    resp = await client.put("/api/config", json={"category_colors": '{"Work":"#5e81ac"}'})
    assert resp.status_code == 200
    data = resp.json()
    assert data["category_colors"] == '{"Work":"#5e81ac"}'
    get_resp = await client.get("/api/config")
    assert get_resp.json()["category_colors"] == '{"Work":"#5e81ac"}'
