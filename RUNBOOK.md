# FairLens Runbook

This document provides operational procedures for deploying, managing, and troubleshooting the FairLens platform.

## Table of Contents
1. [System Overview](#system-overview)
2. [Deployment Procedures](#deployment-procedures)
3. [Operational Procedures](#operational-procedures)
4. [Monitoring and Maintenance](#monitoring-and-maintenance)
5. [Troubleshooting](#troubleshooting)
6. [Backup and Recovery](#backup-and-recovery)
7. [Scaling Guidelines](#scaling-guidelines)

## System Overview

FairLens consists of the following components:

1. **Frontend**: React application served by Nginx
2. **Backend**: FastAPI application with PostgreSQL database
3. **Blockchain**: Algorand smart contracts for payment processing
4. **Infrastructure**: Docker containers orchestrated by Docker Compose

### Ports and Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 8080 | User interface |
| Backend API | 8000 | REST API |
| Database | 5432 | PostgreSQL |
| Redis | 6379 | Caching (optional) |

## Deployment Procedures

### Prerequisites

1. Docker and Docker Compose installed
2. Algorand TestNet account with funding
3. Domain names configured (if using in production)
4. SSL certificates (if using HTTPS)

### Initial Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/fairlens.git
   cd fairlens
   ```

2. Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Update environment variables in both files:
   - Backend: Database credentials, Algorand API keys, JWT secret
   - Frontend: API URL, network settings

4. Start all services:
   ```bash
   cd infra
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

6. Verify deployment:
   ```bash
   docker-compose ps
   curl http://localhost:8000/healthz
   ```

### Updating the Application

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Stop services:
   ```bash
   docker-compose down
   ```

3. Rebuild and start services:
   ```bash
   docker-compose up -d --build
   ```

4. Run database migrations if needed:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

## Operational Procedures

### Starting Services

```bash
cd infra
docker-compose up -d
```

### Stopping Services

```bash
cd infra
docker-compose down
```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### Database Operations

#### Running Migrations

```bash
docker-compose exec backend alembic upgrade head
```

#### Creating Migrations

```bash
docker-compose exec backend alembic revision --autogenerate -m "Migration description"
```

#### Database Backup

```bash
docker-compose exec db pg_dump -U fairlens_user fairlens > backup.sql
```

### Smart Contract Deployment

Smart contracts are automatically deployed when tenders are awarded through the backend API.

To manually deploy a contract:
```bash
cd backend
python scripts/deploy_contract.py
```

## Monitoring and Maintenance

### Health Checks

- API Health: `GET /healthz`
- Database: `SELECT 1;`
- Blockchain: Check Algorand node connectivity

### Performance Monitoring

Key metrics to monitor:
- API response times
- Database query performance
- Blockchain transaction confirmation times
- Container resource usage (CPU, memory, disk)

### Routine Maintenance

1. **Weekly**: Check disk space and clean up old logs
2. **Monthly**: Update Docker images and dependencies
3. **Quarterly**: Review and rotate secrets/keys
4. **Annually**: Review and update SSL certificates

### Log Management

Logs are stored in Docker container logs. For production, consider:

1. Centralized logging with ELK stack or similar
2. Log rotation to prevent disk space issues
3. Alerting on error patterns

## Troubleshooting

### Common Issues

#### Service Won't Start

1. Check logs: `docker-compose logs <service>`
2. Verify environment variables
3. Check port conflicts: `netstat -tulpn | grep <port>`
4. Ensure dependencies are healthy

#### Database Connection Issues

1. Verify database credentials in `.env`
2. Check if database container is running: `docker-compose ps db`
3. Test connection: `docker-compose exec backend pg_isready -h db -U fairlens_user`

#### API Errors

1. Check backend logs: `docker-compose logs backend`
2. Verify Algorand node connectivity
3. Check JWT token validity
4. Review rate limiting

#### Blockchain Issues

1. Verify Algorand API keys
2. Check network connectivity to Algorand nodes
3. Ensure wallet has sufficient funds
4. Review smart contract deployment status

### Debugging Steps

1. **Check Service Status**:
   ```bash
   docker-compose ps
   ```

2. **Review Logs**:
   ```bash
   docker-compose logs --tail=100 <service>
   ```

3. **Test Connectivity**:
   ```bash
   docker-compose exec backend curl http://localhost:8000/healthz
   ```

4. **Database Connection Test**:
   ```bash
   docker-compose exec backend pg_isready -h db -U fairlens_user
   ```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U fairlens_user fairlens > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U fairlens_user fairlens < backup.sql
```

### Configuration Backup

Backup the following files:
- `backend/.env`
- `frontend/.env`
- `infra/docker-compose.yml`
- SSL certificates (if applicable)

### Disaster Recovery

1. Restore database from backup
2. Recreate containers with latest images
3. Reconfigure environment variables
4. Redeploy smart contracts if needed
5. Verify all services are functioning

## Scaling Guidelines

### Horizontal Scaling

- **Frontend**: Multiple instances behind load balancer
- **Backend**: Multiple instances with shared database
- **Database**: Read replicas for read-heavy workloads

### Vertical Scaling

- Increase container resource limits in `docker-compose.yml`
- Upgrade database instance size
- Add more Algorand node endpoints for redundancy

### Performance Optimization

1. **Database**:
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Optimize slow queries

2. **API**:
   - Implement caching for frequently accessed data
   - Use pagination for large result sets
   - Optimize database queries

3. **Frontend**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

### Monitoring Setup

Recommended monitoring tools:
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard and visualization
- **Alertmanager**: Alerting system
- **ELK Stack**: Log aggregation and analysis

Example Prometheus configuration:
```yaml
scrape_configs:
  - job_name: 'fairlens-backend'
    static_configs:
      - targets: ['backend:8000']
```

## Security Considerations

### Regular Security Tasks

1. Update dependencies regularly
2. Rotate secrets and API keys
3. Review access controls
4. Monitor for suspicious activity
5. Perform security audits

### Incident Response

1. Isolate affected systems
2. Preserve evidence
3. Notify stakeholders
4. Apply fixes
5. Document incident and lessons learned

## Contact Information

For operational issues, contact:
- DevOps Team: devops@fairlens.example.com
- Blockchain Team: blockchain@fairlens.example.com
- Support: support@fairlens.example.com

Emergency contact: +1-555-0123 (24/7 on-call)