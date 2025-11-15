"""
Integration tests for the FairLens API
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_auth_endpoints():
    """Test authentication endpoints"""
    # Test registration
    register_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword",
        "role": "contractor"
    }
    
    response = client.post("/auth/register", json=register_data)
    assert response.status_code == 201
    
    # Test login
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }
    
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

if __name__ == "__main__":
    pytest.main([__file__])