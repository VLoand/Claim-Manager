# Claims Manager - Docker Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Claims Manager project files

## Quick Start

### 1. Build and Run Everything
```bash
# Navigate to project root
cd "C:\Users\PC\Desktop\Claims Manager\Claim-Manager"

# Build and start all services
docker-compose up --build
```

### 2. Access the Application
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

### 3. Stop the Application
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database data)
docker-compose down -v
```

## Docker Services

### PostgreSQL (Database)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: claims_manager
- **Credentials**: postgres/postgres123
- **Data**: Persisted in Docker volume

### Backend (Node.js API)
- **Build**: Custom Dockerfile
- **Port**: 3001
- **Environment**: Production-ready
- **Health Check**: Automatic API health monitoring

### Frontend (React + Nginx)
- **Build**: Multi-stage Dockerfile (Node.js build + Nginx serve)
- **Port**: 80
- **Features**: Client-side routing, API proxy, WebSocket support

## Useful Commands

### Development Commands
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up --build backend
```

### Database Commands
```bash
# Connect to PostgreSQL
docker exec -it claims-postgres psql -U postgres -d claims_manager

# Backup database
docker exec claims-postgres pg_dump -U postgres claims_manager > backup.sql

# Restore database
docker exec -i claims-postgres psql -U postgres claims_manager < backup.sql
```

### Troubleshooting
```bash
# Check service status
docker-compose ps

# View container details
docker inspect claims-backend

# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build
```

## Configuration Notes

### Environment Variables
- Database credentials in docker-compose.yml
- JWT secrets should be changed for production
- NODE_ENV set to production

### Volumes
- Database data: Persistent Docker volume
- File uploads: Bind mount to host directory

### Networking
- All services on same Docker network
- Frontend proxies API requests to backend
- WebSocket support enabled

## Production Deployment

For production deployment:
1. Change JWT secrets in docker-compose.yml
2. Use environment-specific configuration
3. Set up proper SSL/TLS certificates
4. Configure proper backup strategy
5. Set up monitoring and logging

## Services CRUD
The Services CRUD is currently commented out but ready for activation during exam defense. Follow the SERVICES_CRUD_ACTIVATION_GUIDE.md to enable it.