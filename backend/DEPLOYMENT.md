# FairLens Backend Deployment Guide

## Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Algorand TestNet account
- Docker (optional, for containerized deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb fairlens

# Or using SQL:
# CREATE DATABASE fairlens;
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your configuration
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (use a strong random string)
- `ALGOD_API_URL`: Algorand API endpoint (TestNet: https://testnet-api.algonode.network)
- `PRIVATE_KEY_MNEMONIC`: Your Algorand wallet mnemonic (for backend operations)

### 4. Run Database Migrations

The database tables will be created automatically on first run. Alternatively, you can use Alembic for migrations:

```bash
# Install Alembic (if not already installed)
pip install alembic

# Initialize Alembic (first time only)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### 5. Run the Application

```bash
# Development mode with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 6. Verify Installation

- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t fairlens-backend .
```

### 2. Run Container

```bash
docker run -p 8000:8000 --env-file .env fairlens-backend
```

### 3. Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: fairlens
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql+asyncpg://user:password@db/fairlens
      JWT_SECRET: ${JWT_SECRET}
      ALGOD_API_URL: ${ALGOD_API_URL}
      PRIVATE_KEY_MNEMONIC: ${PRIVATE_KEY_MNEMONIC}
    ports:
      - "8000:8000"
    depends_on:
      - db

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

## Production Deployment

### 1. Environment Variables

Set the following environment variables in your production environment:

```bash
DATABASE_URL=postgresql+asyncpg://user:password@host/fairlens
JWT_SECRET=<strong-random-secret>
ALGOD_API_URL=https://mainnet-api.algonode.network
ALGOD_API_KEY=<your-api-key>
ALGOD_INDEXER_URL=https://mainnet-idx.algonode.network
ALGOD_INDEXER_KEY=<your-indexer-key>
PRIVATE_KEY_MNEMONIC=<your-wallet-mnemonic>
ENVIRONMENT=production
DEBUG=False
```

### 2. Database Backup

Set up regular database backups:

```bash
# Backup database
pg_dump -U user -d fairlens > backup.sql

# Restore database
psql -U user -d fairlens < backup.sql
```

### 3. SSL/TLS Configuration

Use a reverse proxy (nginx, Traefik) with SSL certificates:

```nginx
server {
    listen 443 ssl;
    server_name api.fairlens.io;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Process Management

Use a process manager like PM2 or systemd:

**PM2:**
```bash
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name fairlens-backend
```

**systemd:**
Create `/etc/systemd/system/fairlens-backend.service`:

```ini
[Unit]
Description=FairLens Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

## Monitoring and Logging

### 1. Application Logs

Logs are written to stdout. In production, use a logging service like:
- CloudWatch (AWS)
- Loggly
- Datadog
- ELK Stack

### 2. Health Checks

Monitor the health endpoint:

```bash
curl http://localhost:8000/api/health
```

### 3. Database Monitoring

Monitor PostgreSQL performance and connections.

## Security Checklist

- [ ] Use strong `JWT_SECRET` in production
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Regularly update dependencies
- [ ] Enable database backups
- [ ] Use rate limiting
- [ ] Implement CORS properly
- [ ] Use secure Algorand wallet storage
- [ ] Regular security audits

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql -U user -d fairlens -c "SELECT 1;"
```

### Algorand Connection Issues

```bash
# Test Algorand connection
curl https://testnet-api.algonode.network/v2/status
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

## Support

For issues and questions, please refer to the main README.md or open an issue on the repository.


