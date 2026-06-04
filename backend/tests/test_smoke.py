"""Smoke tests for grading and the auth endpoints."""
import pytest

from engine.base import CheckResult
from engine.grading import grade_for, score_from


def test_grade_bands():
    assert grade_for(95) == "A"
    assert grade_for(85) == "B"
    assert grade_for(75) == "C"
    assert grade_for(65) == "D"
    assert grade_for(40) == "F"


def test_score_caps_at_100():
    results = [CheckResult("tls", "x", "pass", "info", 0)]
    assert score_from(results) == 100


def test_score_floors_at_0():
    results = [CheckResult("tls", "x", "fail", "critical", -250)]
    assert score_from(results) == 0


@pytest.mark.django_db
def test_register_and_me(api_client):
    resp = api_client.post("/api/auth/register/", {
        "email": "new@example.com",
        "password": "supersecret1",
        "full_name": "New User",
    }, format="json")
    assert resp.status_code == 201, resp.content

    resp = api_client.post("/api/auth/login/", {
        "email": "new@example.com",
        "password": "supersecret1",
    }, format="json")
    assert resp.status_code == 200
    token = resp.json()["access"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    resp = api_client.get("/api/auth/me/")
    assert resp.status_code == 200
    assert resp.json()["email"] == "new@example.com"
