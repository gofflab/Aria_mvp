"""Unit tests for the equipment and subsystem endpoints."""


# ── helpers ───────────────────────────────────────────────────────────────────

def _create_eq(client, **kwargs):
    payload = {
        "name": "Test Analyzer",
        "manufacturer": "Acme Lab",
        "location": "Room 1",
        **kwargs,
    }
    return client.post("/api/equipment/", json=payload)


def _create_ticket(client, equipment_id=None, **kwargs):
    payload = {
        "instrument_part": "Laser — 488nm",
        "problem_description": "Signal dropout on blue channel.",
        "severity": "High",
        "reporter_name": "Dr. Test",
        **kwargs,
    }
    if equipment_id is not None:
        payload["equipment_id"] = equipment_id
    return client.post("/api/tickets/", json=payload)


# ── create equipment ──────────────────────────────────────────────────────────

def test_create_equipment_returns_201(client):
    r = _create_eq(client)
    assert r.status_code == 201
    d = r.json()
    assert d["id"] >= 1
    assert d["name"] == "Test Analyzer"
    assert d["manufacturer"] == "Acme Lab"
    assert d["is_active"] is True
    assert d["subsystems"] == []
    assert d["open_ticket_count"] == 0


def test_create_equipment_with_subsystems(client):
    r = _create_eq(client, subsystems=[
        {"name": "Laser", "description": "Blue laser line", "sort_order": 0},
        {"name": "Detector Array", "sort_order": 1},
    ])
    assert r.status_code == 201
    subs = r.json()["subsystems"]
    assert len(subs) == 2
    assert subs[0]["name"] == "Laser"
    assert subs[1]["name"] == "Detector Array"


def test_create_equipment_missing_name_returns_422(client):
    r = client.post("/api/equipment/", json={"manufacturer": "No Name Corp"})
    assert r.status_code == 422


# ── list equipment ────────────────────────────────────────────────────────────

def test_list_equipment_empty(client):
    r = client.get("/api/equipment/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_equipment_returns_created(client):
    _create_eq(client, name="Scope Alpha")
    _create_eq(client, name="Scope Beta")
    names = [e["name"] for e in client.get("/api/equipment/").json()]
    assert "Scope Alpha" in names
    assert "Scope Beta" in names


# ── get equipment ─────────────────────────────────────────────────────────────

def test_get_equipment(client):
    eq_id = _create_eq(client).json()["id"]
    r = client.get(f"/api/equipment/{eq_id}")
    assert r.status_code == 200
    assert r.json()["id"] == eq_id


def test_get_equipment_not_found(client):
    r = client.get("/api/equipment/999999")
    assert r.status_code == 404


# ── update equipment ──────────────────────────────────────────────────────────

def test_update_equipment_name(client):
    eq_id = _create_eq(client).json()["id"]
    r = client.patch(f"/api/equipment/{eq_id}", json={"name": "Updated Name"})
    assert r.status_code == 200
    assert r.json()["name"] == "Updated Name"


def test_deactivate_equipment(client):
    eq_id = _create_eq(client).json()["id"]
    r = client.patch(f"/api/equipment/{eq_id}", json={"is_active": False})
    assert r.status_code == 200
    assert r.json()["is_active"] is False


def test_update_equipment_not_found(client):
    r = client.patch("/api/equipment/999999", json={"name": "Ghost"})
    assert r.status_code == 404


# ── delete equipment ──────────────────────────────────────────────────────────

def test_delete_equipment(client):
    eq_id = _create_eq(client).json()["id"]
    r = client.delete(f"/api/equipment/{eq_id}")
    assert r.status_code == 204
    assert client.get(f"/api/equipment/{eq_id}").status_code == 404


def test_delete_equipment_not_found(client):
    r = client.delete("/api/equipment/999999")
    assert r.status_code == 404


def test_delete_equipment_nullifies_ticket_equipment_id(client):
    """Deleting equipment should SET NULL on tickets, not delete them."""
    eq_id = _create_eq(client).json()["id"]
    ticket_id = _create_ticket(client, equipment_id=eq_id).json()["id"]
    client.delete(f"/api/equipment/{eq_id}")
    ticket = client.get(f"/api/tickets/{ticket_id}").json()
    assert ticket["equipment_id"] is None


# ── subsystems ────────────────────────────────────────────────────────────────

def test_add_subsystem(client):
    eq_id = _create_eq(client).json()["id"]
    r = client.post(f"/api/equipment/{eq_id}/subsystems", json={"name": "PMT Array", "sort_order": 0})
    assert r.status_code == 201
    assert r.json()["name"] == "PMT Array"
    assert r.json()["equipment_id"] == eq_id


def test_add_subsystem_appears_on_equipment(client):
    eq_id = _create_eq(client).json()["id"]
    client.post(f"/api/equipment/{eq_id}/subsystems", json={"name": "A", "sort_order": 0})
    client.post(f"/api/equipment/{eq_id}/subsystems", json={"name": "B", "sort_order": 1})
    subs = client.get(f"/api/equipment/{eq_id}").json()["subsystems"]
    assert [s["name"] for s in subs] == ["A", "B"]


def test_add_subsystem_to_missing_equipment_returns_404(client):
    r = client.post("/api/equipment/999999/subsystems", json={"name": "Laser"})
    assert r.status_code == 404


def test_update_subsystem(client):
    eq_id = _create_eq(client).json()["id"]
    sub_id = client.post(f"/api/equipment/{eq_id}/subsystems", json={"name": "Old Name"}).json()["id"]
    r = client.patch(f"/api/equipment/{eq_id}/subsystems/{sub_id}", json={"name": "New Name"})
    assert r.status_code == 200
    assert r.json()["name"] == "New Name"


def test_delete_subsystem(client):
    eq_id = _create_eq(client).json()["id"]
    sub_id = client.post(f"/api/equipment/{eq_id}/subsystems", json={"name": "Temp"}).json()["id"]
    r = client.delete(f"/api/equipment/{eq_id}/subsystems/{sub_id}")
    assert r.status_code == 204
    subs = client.get(f"/api/equipment/{eq_id}").json()["subsystems"]
    assert all(s["id"] != sub_id for s in subs)


def test_delete_subsystem_wrong_equipment_returns_404(client):
    eq1 = _create_eq(client, name="Eq1").json()["id"]
    eq2 = _create_eq(client, name="Eq2").json()["id"]
    sub_id = client.post(f"/api/equipment/{eq1}/subsystems", json={"name": "Part"}).json()["id"]
    r = client.delete(f"/api/equipment/{eq2}/subsystems/{sub_id}")
    assert r.status_code == 404


def test_delete_equipment_cascades_subsystems(client):
    eq_id = _create_eq(client).json()["id"]
    client.post(f"/api/equipment/{eq_id}/subsystems", json={"name": "Part A"})
    client.delete(f"/api/equipment/{eq_id}")
    assert client.get(f"/api/equipment/{eq_id}").status_code == 404


# ── ticket counts ─────────────────────────────────────────────────────────────

def test_equipment_ticket_counts(client):
    eq_id = _create_eq(client).json()["id"]
    _create_ticket(client, equipment_id=eq_id)
    _create_ticket(client, equipment_id=eq_id)
    r = client.get(f"/api/equipment/{eq_id}").json()
    assert r["total_ticket_count"] == 2
    assert r["open_ticket_count"] == 2


def test_equipment_ticket_filter(client):
    eq1 = _create_eq(client, name="Eq A").json()["id"]
    eq2 = _create_eq(client, name="Eq B").json()["id"]
    _create_ticket(client, equipment_id=eq1)
    _create_ticket(client, equipment_id=eq2)
    _create_ticket(client, equipment_id=eq2)
    tickets_for_eq2 = client.get(f"/api/tickets/?equipment_id={eq2}").json()
    assert len(tickets_for_eq2) == 2
    assert all(t["equipment_id"] == eq2 for t in tickets_for_eq2)


def test_equipment_tickets_endpoint(client):
    eq_id = _create_eq(client).json()["id"]
    _create_ticket(client, equipment_id=eq_id)
    r = client.get(f"/api/equipment/{eq_id}/tickets")
    assert r.status_code == 200
    assert len(r.json()) == 1
