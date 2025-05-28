# Running Palmr with Docker (without docker-compose)

This document explains how to run Palmr and PostgreSQL using separate Docker commands, without the need for docker-compose.

## Prerequisites

- Docker installed
- Docker network created for container communication

## 1. Create Docker Network

First, create a custom network to allow communication between containers:

```bash
docker network create palmr-network
```

## 2. Create Volumes

Create the necessary volumes for data persistence:

```bash
# Volume for PostgreSQL data
docker volume create postgres_data

# Volume for Palmr uploads
docker volume create palmr_uploads

# Volume for temporary chunks
docker volume create palmr_temp_chunks
```

## 3. Run PostgreSQL Container

Run the PostgreSQL container first:

```bash
docker run -d \
  --name palmr-database \
  --network palmr-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgresRootPassword \
  -e POSTGRES_DB=palmr_db \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  --health-cmd="pg_isready -U postgres -d palmr_db" \
  --health-interval=5s \
  --health-timeout=3s \
  --health-retries=6 \
  --health-start-period=30s \
  postgres:16-alpine
```

## 4. Wait for PostgreSQL to be Healthy

Wait for PostgreSQL to become healthy before starting Palmr:

```bash
# Check container status
docker ps

# Check logs if necessary
docker logs palmr-database

# Wait until health status is "healthy"
docker inspect palmr-database --format='{{.State.Health.Status}}'
```

## 5. Run Palmr Container

After PostgreSQL is running, execute the Palmr container:

```bash
docker run -d \
  --name palmr-application \
  --network palmr-network \
  -e ENABLE_S3=false \
  -e ENCRYPTION_KEY=change-this-key-in-production-min-32-chars \
  -e DATABASE_URL="postgresql://postgres:postgresRootPassword@palmr-database:5432/palmr_db?schema=public" \
  -e FRONTEND_URL="http://palmr-application:5487" \
  -e MAX_FILESIZE=1073741824 \
  -e NODE_ENV=production \
  -e NEXT_TELEMETRY_DISABLED=1 \
  -e API_BASE_URL="http://palmr-application:3333" \
  -v palmr_uploads:/app/server/uploads \
  -v palmr_temp_chunks:/app/server/temp-chunks \
  -p 3333:3333 \
  -p 5487:5487 \
  --restart unless-stopped \
  --health-cmd='sh -c "wget --no-verbose --tries=1 --spider http://palmr-application:3333/health && wget --no-verbose --tries=1 --spider http://palmr-application:5487"' \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=5 \
  --health-start-period=120s \
  kyantech/palmr:latest
```

## 6. Verify Execution

Check if both containers are running correctly:

```bash
# Check running containers
docker ps

# Check PostgreSQL logs
docker logs palmr-database

# Check Palmr logs
docker logs palmr-application

# Check container health
docker inspect palmr-database --format='{{.State.Health.Status}}'
docker inspect palmr-application --format='{{.State.Health.Status}}'
```

## 7. Application Access

After both containers are healthy:

- **API**: http://localhost:3333
- **Frontend**: http://localhost:5487
- **PostgreSQL**: localhost:5432

## 8. Management Commands

### Stop containers:
```bash
docker stop palmr-application palmr-database
```

### Remove containers:
```bash
docker rm palmr-application palmr-database
```

### Remove network:
```bash
docker network rm palmr-network
```

### Remove volumes (WARNING - this will delete all data):
```bash
docker volume rm postgres_data palmr_uploads palmr_temp_chunks
```

## 9. Customization with Environment Variables

You can customize configurations by changing the environment variables in the commands above:

- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password  
- `POSTGRES_DB`: PostgreSQL database name
- `ENCRYPTION_KEY`: encryption key (minimum 32 characters)
- `MAX_FILESIZE`: maximum file size in bytes
- Ports can be changed using `-p HOST_PORT:CONTAINER_PORT`

## 10. Example with Custom Variables

```bash
# PostgreSQL with custom configurations
docker run -d \
  --name palmr-database \
  --network palmr-network \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword123 \
  -e POSTGRES_DB=my_palmr_db \
  -v postgres_data:/var/lib/postgresql/data \
  -p 15432:5432 \
  --restart unless-stopped \
  postgres:16-alpine

# Palmr with corresponding configurations
docker run -d \
  --name palmr-application \
  --network palmr-network \
  -e ENABLE_S3=false \
  -e ENCRYPTION_KEY=my-super-secret-key-32-chars-minimum \
  -e DATABASE_URL="postgresql://myuser:mypassword123@palmr-database:5432/my_palmr_db?schema=public" \
  -e FRONTEND_URL="http://palmr-application:8080" \
  -e MAX_FILESIZE=2147483648 \
  -e NODE_ENV=production \
  -e NEXT_TELEMETRY_DISABLED=1 \
  -e API_BASE_URL="http://palmr-application:8081" \
  -v palmr_uploads:/app/server/uploads \
  -v palmr_temp_chunks:/app/server/temp-chunks \
  -p 8081:3333 \
  -p 8080:5487 \
  --restart unless-stopped \
  kyantech/palmr:latest
``` 