# OpenFaith Environment Configuration

This document explains how to configure OpenFaith for different deployment environments.

## 🏗️ Environment Types

### Local Development

- **Database**: PostgreSQL running in Docker (localhost:5430)
- **Redis**: Redis running in Docker (localhost:6379)
- **Services**: Running via `bun run dev` (localhost:3000, 4000, etc.)
- **Configuration**: `env.example` → `.env`

### Kubernetes Production

- **Database**: PostgreSQL service in Kubernetes (postgres-service:5432)
- **Redis**: Redis service in Kubernetes (redis-service:6379)
- **Services**: Running as Kubernetes pods
- **Configuration**: `env.k8s.example` → `.env`

## 📁 Configuration Files

### `env.example` (Local Development)

```bash
# Database Configuration
DB_HOST_PRIMARY=localhost
DB_NAME=postgres
DB_PASSWORD=password
DB_PORT=5430
DB_USERNAME=user

# Zero Configuration
ZERO_UPSTREAM_DB=postgresql://user:password@localhost:5430/postgres
ZERO_CVR_DB=postgresql://user:password@localhost:5430/postgres
ZERO_CHANGE_DB=postgresql://user:password@localhost:5430/postgres
```

### `env.k8s.example` (Kubernetes Production)

```bash
# Database Configuration
DB_HOST_PRIMARY=postgres-service
DB_NAME=postgres
DB_PASSWORD=your-secure-database-password
DB_PORT=5432
DB_USERNAME=user

# Zero Configuration
ZERO_UPSTREAM_DB=postgresql://user:your-secure-database-password@postgres-service:5432/postgres
ZERO_CVR_DB=postgresql://user:your-secure-database-password@postgres-service:5432/postgres
ZERO_CHANGE_DB=postgresql://user:your-secure-database-password@postgres-service:5432/postgres
```

## 🔄 Environment Switching

### Automatic Switching

The deployment scripts automatically handle environment switching:

```bash
# Deploy to Kubernetes (automatically switches to K8s config)
./scripts/deploy-k8s.sh

# Build and deploy (automatically switches to K8s config)
./scripts/build-and-deploy.sh
```

### Manual Switching

Use the environment switcher script:

```bash
# Switch to local development
./scripts/switch-env.sh local

# Switch to Kubernetes
./scripts/switch-env.sh k8s

# Check current configuration
./scripts/switch-env.sh status

# Sync current .env to all packages
./scripts/switch-env.sh sync
```

## 🗄️ Database Configuration Details

### Local Development Database

- **Host**: `localhost`
- **Port**: `5430` (mapped from container port 5432)
- **Database**: `postgres`
- **User**: `user`
- **Password**: `password`
- **Connection String**: `postgresql://user:password@localhost:5430/postgres`

### Kubernetes Database

- **Host**: `postgres-service` (Kubernetes service name)
- **Port**: `5432` (internal cluster port)
- **Database**: `postgres`
- **User**: `user`
- **Password**: From Kubernetes secret `openfaith-secrets.DB_PASSWORD`
- **Connection String**: `postgresql://user:$(DB_PASSWORD)@postgres-service:5432/postgres`

## 🔐 Secrets Management

### Local Development

- **Secrets**: Stored in `.env` file (not committed to git)
- **Database Password**: `password` (development only)
- **Auth Secret**: `your-secret-key-here-change-this-in-production`

### Kubernetes Production

- **Secrets**: Stored in Kubernetes secrets
- **Database Password**: From `k8s/secrets.yaml` → `openfaith-secrets.DB_PASSWORD`
- **Auth Secret**: From `k8s/secrets.yaml` → `openfaith-secrets.BETTER_AUTH_SECRET`

## 🌐 Service Discovery

### Local Development

Services communicate via localhost:

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://backend-service:4000`
- **Workers**: `http://localhost:3001`
- **Shard Manager**: `http://localhost:3002`

### Kubernetes Production

Services communicate via Kubernetes service names:

- **Frontend**: `http://frontend-service:80`
- **Backend API**: `http://backend-service:4000`
- **Workers**: `http://workers-service:3001`
- **Shard Manager**: `http://shard-manager-service:3002`

## 📊 Zero Configuration

Zero (client-side sync) requires specific database connection strings and replica file configuration:

### Local Development

```bash
ZERO_UPSTREAM_DB=postgresql://user:password@localhost:5430/postgres
ZERO_CVR_DB=postgresql://user:password@localhost:5430/postgres
ZERO_CHANGE_DB=postgresql://user:password@localhost:5430/postgres
ZERO_REPLICA_FILE=./replica.db
```

### Kubernetes Production

```bash
ZERO_UPSTREAM_DB=postgresql://user:$(DB_PASSWORD)@postgres-service:5432/postgres
ZERO_CVR_DB=postgresql://user:$(DB_PASSWORD)@postgres-service:5432/postgres
ZERO_CHANGE_DB=postgresql://user:$(DB_PASSWORD)@postgres-service:5432/postgres
ZERO_REPLICA_FILE=/data/zero.db
```

**Important**: In Kubernetes, `ZERO_REPLICA_FILE` points to a persistent volume mount (`/data/zero.db`) to ensure the local SQLite replica persists across pod restarts. See [Zero Replica Storage](./zero-replica-storage.md) for detailed information.

## 🔧 Configuration Workflow

### For Local Development

1. **Start Infrastructure**: `bun run infra`
2. **Switch Environment**: `./scripts/switch-env.sh local`
3. **Start Services**: `bun run dev`

### For Kubernetes Deployment

1. **Update Secrets**: Edit `k8s/secrets.yaml` with real values
2. **Update Domains**: Edit `k8s/configmap.yaml` and `k8s/ingress.yaml`
3. **Deploy**: `./scripts/build-and-deploy.sh`

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker logs openfaith-postgres-1

# Test connection
psql -h localhost -p 5430 -U user -d postgres
```

#### 2. Environment Configuration Issues

```bash
# Check current configuration
./scripts/switch-env.sh status

# Verify .env file exists
ls -la .env

# Check if environment is synced to packages
ls -la packages/*/.env
```

#### 3. Kubernetes Service Discovery Issues

```bash
# Check if services are running
kubectl get pods -n openfaith

# Check service endpoints
kubectl get endpoints -n openfaith

# Test service connectivity
kubectl exec -it deployment/backend -n openfaith -- nslookup postgres-service
```

### Debug Commands

```bash
# Check environment variables in running container
kubectl exec -it deployment/backend -n openfaith -- env | grep DB_

# Check service connectivity
kubectl exec -it deployment/backend -n openfaith -- curl http://postgres-service:5432

# View application logs
kubectl logs -f deployment/backend -n openfaith
```

## 📚 Additional Resources

- [Kubernetes Service Discovery](https://kubernetes.io/docs/concepts/services-networking/service/)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Zero Database Configuration](https://rocicorp.dev/docs/zero/guides/database-setup)
