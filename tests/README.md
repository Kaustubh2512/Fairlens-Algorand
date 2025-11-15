# Tests

This directory contains the test suite for the FairLens application.

## Test Structure

```
tests/
├── e2e/          # End-to-end tests
├── integration/  # Integration tests
└── unit/         # Unit tests (located in respective component directories)
```

## Test Types

### Unit Tests
- Backend: Located in `backend/app/tests/`
- Frontend: Located in `frontend/src/__tests__/`
- Smart Contracts: Located in `backend/app/contracts/tests/`

### Integration Tests
- Test interactions between different components
- Database integration tests
- API integration tests
- Blockchain integration tests

### End-to-End Tests
- Full user journey tests
- Browser automation tests
- Cross-component workflow tests

## Running Tests

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Smart Contract Tests
```bash
cd backend/app/contracts
python test_contracts.py
```

## Test Environment

Tests should be run in an isolated environment with:
- Test database
- Mocked external services
- Test Algorand sandbox (for blockchain tests)

## Continuous Integration

Tests are automatically run on every push and pull request through GitHub Actions.