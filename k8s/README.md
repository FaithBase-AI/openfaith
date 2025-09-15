# OpenFaith Kubernetes Deployment

## Quick Start

1. **Setup Secrets** (REQUIRED):

   ```bash
   cp secrets.yaml.template secrets.yaml
   # Edit secrets.yaml with your actual values
   ```

   Create a github access token with registry pull permission scope

   ```bash
   kubectl -n openfaith create secret docker-registry ghcr-pull-secret\
   --docker-server=ghcr.io \
   --docker-username=your_username \
   --docker-password=ghp_pull_secret \
   --docker-email=your_email
   ```

2. **Deploy Everything**:

   ```bash
   kubectl apply -f namespace.yaml
   kubectl apply -f secrets.yaml
   kubectl apply -f configmap.yaml
   kubectl apply -f frontend-configmap.yaml
   kubectl apply -f postgres.yaml
   kubectl apply -f redis.yaml
   kubectl apply -f zero-storage.yaml
   kubectl apply -f opentelemetry.yaml
   kubectl apply -f zero.yaml          # ← NEW: Zero cache service (requires DB)
   kubectl apply -f workers.yaml
   kubectl apply -f shard-manager.yaml
   kubectl apply -f frontend.yaml
   kubectl apply -f ingress.yaml
   ```

3. **Run Database Migration**:

   ```bash
   kubectl apply -f migrate-job.yaml
   ```

4. **Check Deployment**:
   ```bash
   kubectl get pods -n openfaith
   kubectl get ingress -n openfaith
   ```

## Storage Configuration

### Persistent Storage Setup

This deployment uses **hostPath-based storage** for development environments:

| Component      | Storage Type | Host Path                | Purpose                    |
| -------------- | ------------ | ------------------------ | -------------------------- |
| **PostgreSQL** | hostPath PV  | `/data/postgres`         | Database files & WAL logs  |
| **Redis**      | hostPath PV  | `/tmp/redis-data`        | Cache & session data       |
| **Zero Cache** | hostPath PV  | `/tmp/zero-replica-data` | Sync replica & permissions |

#### How It Works:

1. **PersistentVolumes (PVs)**: Pre-defined storage resources on the host
2. **PersistentVolumeClaims (PVCs)**: Pod requests that bind to available PVs
3. **hostPath**: Uses directories on the Kubernetes node's filesystem

**⚠️ Note**: This setup is for **development/testing** only. Production requires:

- Proper StorageClass (e.g., `local-path`, `nfs`, cloud storage)
- Dynamic volume provisioning
- Backup strategies

### Check Storage Status:

```bash
kubectl get pv,pvc -n openfaith
kubectl describe pvc postgres-pvc -n openfaith
```

## Secrets Configuration

**⚠️ CRITICAL**: Never commit `secrets.yaml` to git!

### Required Secrets

Edit `secrets.yaml` with these values:

- **`DB_PASSWORD`**: PostgreSQL password
- **`BETTER_AUTH_SECRET`**: 32+ character random string for auth
- **`RESEND_API_KEY`**: Your Resend email service API key
- **`PLANNING_CENTER_SECRET`**: Planning Center API secret
- **`ZERO_ADMIN_PASSWORD`**: Admin password for Zero sync
- **`VITE_PLANNING_CENTER_CLIENT_ID`**: Planning Center client ID

### Zero Configuration

The Zero cache service requires proper database connections and persistent storage:

- **Database Connections**: Zero needs separate connections to PostgreSQL for upstream, CVR, and change tracking
- **Persistent Storage**: Zero replica data is stored in a PersistentVolumeClaim (`zero-replica-pvc`)
- **Admin Password**: Used for Zero management operations
- **Service URL**: Frontend connects to `http://zero-service:4983`

### Generate Secure Secrets

```bash
# Generate secure random strings
openssl rand -hex 32  # For BETTER_AUTH_SECRET
openssl rand -hex 16  # For ZERO_ADMIN_PASSWORD
```

## Architecture

```
Browser → Ingress → Frontend (React) + Backend (Better Auth + Effect APIs)
                 ↓
                 PostgreSQL + Redis + Zero Cache + Workers + Shard Manager
```

### Services Overview

| Service           | Port      | Purpose                        | Health Check   |
| ----------------- | --------- | ------------------------------ | -------------- |
| **Frontend**      | 3000      | React SPA with TanStack Router | N/A            |
| **Backend**       | 4000      | Effect APIs + Better Auth      | `/health`      |
| **Zero Cache**    | 4983      | Client-side data sync          | `/`            |
| **Workers**       | 3020      | Background job processing      | `/health`      |
| **Shard Manager** | 8080      | Database connection management | TCP 8080       |
| **PostgreSQL**    | 5432      | Primary database               | pg_isready     |
| **Redis**         | 6379      | Caching & sessions             | redis-cli ping |
| **OpenTelemetry** | 4317/4318 | Observability                  | N/A            |

## Accessing the Application

Once deployed, the application is available at the ingress IP:

```bash
kubectl get ingress -n openfaith
# Access via the EXTERNAL-IP shown
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n openfaith
kubectl get services -n openfaith
kubectl logs -n openfaith deployment/zero
```

### Check Database

```bash
kubectl exec -n openfaith deployment/postgres -- psql -U user postgres -c "\dt openfaith_*;"
```

### Check Zero Cache Service

```bash
# Check Zero service status
kubectl logs -n openfaith deployment/zero

# Test Zero service connectivity
kubectl port-forward -n openfaith svc/zero-service 4983:4983 &
curl http://localhost:4983

# Check Zero replica data persistence
kubectl exec -n openfaith deployment/zero -- ls -la /data/
kubectl get pvc -n openfaith zero-replica-pvc
```

### Check Ingress

```bash
kubectl describe ingress -n openfaith
kubectl get ingress -n openfaith -o wide
```

## Security Notes

- `secrets.yaml` is gitignored - never commit real secrets
- Use strong passwords for all services
- Better Auth secret should be 32+ characters
- Consider using Kubernetes secrets management tools in production
- **Zero Data Persistence**: The `zero-replica-pvc` contains critical sync state - backup regularly
- **Database Consistency**: Zero maintains separate database connections - ensure all three (upstream, CVR, change) point to the same PostgreSQL instance
