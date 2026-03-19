"""Unit tests for ticket CRUD endpoints."""
import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def _create(client, **kwargs):
    payload = {
        "instrument_part": "Nozzle / Flow Cell",
        "problem_description": "Clog detected during sort.",
        "severity": "High",
        "reporter_name": "Dr. Smith",
        **kwargs,
    }
    return client.post("/api/tickets/", json=payload)


# ── create ────────────────────────────────────────────────────────────────────

def test_create_ticket_returns_201(client):
    r = _create(client)
    assert r.status_code == 201
    data = r.json()
    assert data["id"] >= 1
    assert data["status"] == "Open"
    assert data["severity"] == "High"
    assert data["reporter_name"] == "Dr. Smith"
    assert data["instrument_part"] == "Nozzle / Flow Cell"


def test_create_ticket_defaults_severity_medium(client):
    r = client.post("/api/tickets/", json={
        "instrument_part": "FSC Detector",
        "problem_description": "Noisy signal.",
        "reporter_name": "Lab Tech",
    })
    assert r.status_code == 201
    assert r.json()["severity"] == "Medium"


def test_create_ticket_missing_required_fields_returns_422(client):
    r = client.post("/api/tickets/", json={"instrument_part": "FSC Detector"})
    assert r.status_code == 422


# ── list ──────────────────────────────────────────────────────────────────────

def test_list_tickets_empty(client):
    r = client.get("/api/tickets/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_tickets_returns_created(client):
    _create(client, reporter_name="Alice")
    _create(client, reporter_name="Bob", severity="Low")
    r = client.get("/api/tickets/")
    assert r.status_code == 200
    names = [t["reporter_name"] for t in r.json()]
    assert "Alice" in names
    assert "Bob" in names


def test_list_tickets_filter_by_status(client):
    _create(client)
    r = client.get("/api/tickets/", params={"status": "Open"})
    assert r.status_code == 200
    assert all(t["status"] == "Open" for t in r.json())


def test_list_tickets_filter_by_severity(client):
    _create(client, severity="High")
    _create(client, severity="Low")
    r = client.get("/api/tickets/", params={"severity": "High"})
    assert r.status_code == 200
    assert all(t["severity"] == "High" for t in r.json())


# ── get ───────────────────────────────────────────────────────────────────────

def test_get_ticket(client):
    ticket_id = _create(client).json()["id"]
    r = client.get(f"/api/tickets/{ticket_id}")
    assert r.status_code == 200
    assert r.json()["id"] == ticket_id


def test_get_ticket_not_found(client):
    r = client.get("/api/tickets/999999")
    assert r.status_code == 404


# ── update ────────────────────────────────────────────────────────────────────

def test_update_ticket_status(client):
    ticket_id = _create(client).json()["id"]
    r = client.patch(f"/api/tickets/{ticket_id}", json={"status": "In Progress"})
    assert r.status_code == 200
    assert r.json()["status"] == "In Progress"


def test_update_ticket_resolved_stamps_resolved_at(client):
    ticket_id = _create(client).json()["id"]
    r = client.patch(f"/api/tickets/{ticket_id}", json={"status": "Resolved"})
    assert r.status_code == 200
    assert r.json()["resolved_at"] is not None


def test_update_ticket_unresolved_clears_resolved_at(client):
    ticket_id = _create(client).json()["id"]
    client.patch(f"/api/tickets/{ticket_id}", json={"status": "Resolved"})
    r = client.patch(f"/api/tickets/{ticket_id}", json={"status": "In Progress"})
    assert r.json()["resolved_at"] is None


def test_update_ticket_assign(client):
    ticket_id = _create(client).json()["id"]
    r = client.patch(f"/api/tickets/{ticket_id}", json={"assigned_to": "Tech Jane"})
    assert r.status_code == 200
    assert r.json()["assigned_to"] == "Tech Jane"


def test_update_ticket_not_found(client):
    r = client.patch("/api/tickets/999999", json={"status": "Resolved"})
    assert r.status_code == 404


# ── delete ────────────────────────────────────────────────────────────────────

def test_delete_ticket(client):
    ticket_id = _create(client).json()["id"]
    r = client.delete(f"/api/tickets/{ticket_id}")
    assert r.status_code == 204
    assert client.get(f"/api/tickets/{ticket_id}").status_code == 404


def test_delete_ticket_not_found(client):
    r = client.delete("/api/tickets/999999")
    assert r.status_code == 404


# ── history ───────────────────────────────────────────────────────────────────

def test_history_returns_only_resolved(client):
    t1 = _create(client).json()["id"]
    t2 = _create(client).json()["id"]
    client.patch(f"/api/tickets/{t1}", json={"status": "Resolved"})
    # t2 stays Open
    r = client.get("/api/tickets/history/resolved")
    assert r.status_code == 200
    ids = [t["id"] for t in r.json()]
    assert t1 in ids
    assert t2 not in ids
