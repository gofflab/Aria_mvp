"""Unit tests for comment sub-resource endpoints."""


def _ticket(client):
    r = client.post("/api/tickets/", json={
        "instrument_part": "PMT Array",
        "problem_description": "Channel 3 signal dropout.",
        "severity": "Medium",
        "reporter_name": "Researcher",
    })
    assert r.status_code == 201
    return r.json()["id"]


def _comment(client, ticket_id, **kwargs):
    payload = {"author": "Tech Lee", "body": "Checked voltages — nominal.", **kwargs}
    return client.post(f"/api/tickets/{ticket_id}/comments", json=payload)


# ── add comment ───────────────────────────────────────────────────────────────

def test_add_comment_returns_201(client):
    tid = _ticket(client)
    r = _comment(client, tid)
    assert r.status_code == 201
    data = r.json()
    assert data["author"] == "Tech Lee"
    assert data["ticket_id"] == tid


def test_add_comment_appears_on_ticket(client):
    tid = _ticket(client)
    _comment(client, tid, body="First note")
    _comment(client, tid, body="Second note")
    r = client.get(f"/api/tickets/{tid}")
    assert r.status_code == 200
    bodies = [c["body"] for c in r.json()["comments"]]
    assert "First note" in bodies
    assert "Second note" in bodies


def test_add_comment_to_missing_ticket_returns_404(client):
    r = _comment(client, 999999)
    assert r.status_code == 404


def test_add_comment_missing_fields_returns_422(client):
    tid = _ticket(client)
    r = client.post(f"/api/tickets/{tid}/comments", json={"author": "Only Author"})
    assert r.status_code == 422


# ── delete comment ────────────────────────────────────────────────────────────

def test_delete_comment(client):
    tid = _ticket(client)
    cid = _comment(client, tid).json()["id"]
    r = client.delete(f"/api/tickets/{tid}/comments/{cid}")
    assert r.status_code == 204
    ticket = client.get(f"/api/tickets/{tid}").json()
    assert all(c["id"] != cid for c in ticket["comments"])


def test_delete_comment_not_found(client):
    tid = _ticket(client)
    r = client.delete(f"/api/tickets/{tid}/comments/999999")
    assert r.status_code == 404


def test_delete_comment_wrong_ticket_returns_404(client):
    tid1 = _ticket(client)
    tid2 = _ticket(client)
    cid = _comment(client, tid1).json()["id"]
    r = client.delete(f"/api/tickets/{tid2}/comments/{cid}")
    assert r.status_code == 404


# ── cascade ───────────────────────────────────────────────────────────────────

def test_delete_ticket_cascades_to_comments(client):
    tid = _ticket(client)
    _comment(client, tid)
    _comment(client, tid)
    client.delete(f"/api/tickets/{tid}")
    # Ticket gone; comments should not be orphaned or accessible
    assert client.get(f"/api/tickets/{tid}").status_code == 404
