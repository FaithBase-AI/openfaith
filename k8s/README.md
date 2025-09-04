# OpenFaith Kubernetes Deployment

## Quick Start

1. **Setup Secrets** (REQUIRED):

   ```bash
   cp secrets.yaml.template secrets.yaml
   # Edit secrets.yaml with your actual values
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
   kubectl apply -f backend.yaml
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
                 PostgreSQL + Redis + Workers + Shard Manager
```

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
kubectl logs -n openfaith deployment/backend
```

### Check Database

```bash
kubectl exec -n openfaith deployment/postgres -- psql -U user postgres -c "\dt openfaith_*;"
```

### Check Ingress

```bash
kubectl describe ingress -n openfaith
```

## Security Notes

- `secrets.yaml` is gitignored - never commit real secrets
- Use strong passwords for all services
- Better Auth secret should be 32+ characters
- Consider using Kubernetes secrets management tools in production
