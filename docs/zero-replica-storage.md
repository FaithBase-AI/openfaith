# Zero Replica Storage in Kubernetes

This document explains how the `ZERO_REPLICA_FILE` configuration is handled in Kubernetes deployments.

## 🗄️ What is ZERO_REPLICA_FILE?

The `ZERO_REPLICA_FILE` environment variable specifies the location of the local SQLite replica database used by Rocicorp Zero for **client-side synchronization**. This file contains:

- **Local data cache** - Frequently accessed data for instant queries
- **Sync state** - Information about what data has been synchronized
- **Query results** - Cached results from ZQL queries
- **Optimistic updates** - Local changes pending server sync

**Important**: Only the **frontend (React app)** uses Zero client-side sync and needs the replica file. Backend services act as Zero servers and do not need replica files.

## 🏗️ Local Development vs Kubernetes

### Local Development

```bash
ZERO_REPLICA_FILE=./replica.db
```

- **Location**: Current working directory
- **Persistence**: File persists between application restarts
- **Sharing**: Single file shared across all development instances

### Kubernetes Production

```bash
ZERO_REPLICA_FILE=/data/zero.db
```

- **Location**: Persistent volume mount at `/data`
- **Persistence**: File persists across pod restarts
- **Sharing**: Each pod has its own replica file

## 🔧 Kubernetes Configuration

### Persistent Volume Claims

Only the frontend service needs a persistent volume for the Zero replica file:

```yaml
# k8s/zero-storage.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: zero-replica-pvc
  namespace: openfaith
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: standard
```

### Volume Mounts

Only the frontend service mounts the persistent volume at `/data`:

```yaml
# k8s/frontend.yaml
spec:
  template:
    spec:
      containers:
        - name: frontend
          volumeMounts:
            - name: zero-replica-storage
              mountPath: /data
      volumes:
        - name: zero-replica-storage
          persistentVolumeClaim:
            claimName: zero-replica-pvc
```

## 📊 Storage Requirements

### Size Considerations

- **Initial Size**: ~1-10MB for empty replica
- **Growth**: Depends on data usage patterns
- **Recommended**: 1GB per service (allows for growth)
- **Maximum**: Typically < 100MB for most applications

### Performance Considerations

- **Storage Class**: Use SSD storage for better performance
- **Access Mode**: `ReadWriteOnce` (each pod needs exclusive access)
- **Reclaim Policy**: `Retain` for production (prevents data loss)

## 🔄 Data Lifecycle

### Pod Startup

1. **Volume Mount**: Persistent volume mounted at `/data`
2. **File Check**: Zero checks for existing `/data/zero.db`
3. **Initialization**:
   - If file exists: Load existing replica
   - If file doesn't exist: Create new replica
4. **Sync**: Begin synchronization with upstream database

### Pod Restart

1. **Volume Persists**: Data remains in persistent volume
2. **File Recovery**: Zero loads existing replica file
3. **Sync Resume**: Continue synchronization from last known state

### Pod Termination

1. **Graceful Shutdown**: Zero saves any pending changes
2. **Volume Detached**: Persistent volume becomes available for other pods
3. **Data Preserved**: Replica file remains in persistent volume

## 🚨 Important Considerations

### ReadWriteOnce Limitation

- **Single Pod**: Only one pod can mount a `ReadWriteOnce` volume
- **Scaling**: Each replica needs its own persistent volume
- **Backup**: Each replica is independent

### Data Consistency

- **Eventual Consistency**: Replicas sync with upstream database
- **Conflict Resolution**: Zero handles conflicts automatically
- **Data Loss**: Pod crashes don't cause data loss (data in persistent volume)

### Security

- **File Permissions**: Ensure container has write access to `/data`
- **Encryption**: Consider encrypting persistent volumes for sensitive data
- **Access Control**: Limit access to persistent volumes

## 🔧 Troubleshooting

### Common Issues

#### 1. Permission Denied

```bash
# Check file permissions
kubectl exec -it deployment/backend -n openfaith -- ls -la /data/

# Fix permissions if needed
kubectl exec -it deployment/backend -n openfaith -- chmod 755 /data
```

#### 2. Volume Not Mounted

```bash
# Check volume mounts
kubectl describe pod <pod-name> -n openfaith

# Check persistent volume status
kubectl get pv
kubectl get pvc -n openfaith
```

#### 3. Storage Full

```bash
# Check disk usage
kubectl exec -it deployment/backend -n openfaith -- df -h /data

# Check file sizes
kubectl exec -it deployment/backend -n openfaith -- du -sh /data/*
```

### Debug Commands

```bash
# Check Zero replica file
kubectl exec -it deployment/backend -n openfaith -- ls -la /data/zero.db

# Check Zero logs
kubectl logs -f deployment/backend -n openfaith | grep -i zero

# Check persistent volume status
kubectl get pv,pvc -n openfaith
```

## 📚 Best Practices

### Storage Management

1. **Monitor Usage**: Track replica file sizes over time
2. **Regular Backups**: Backup persistent volumes for disaster recovery
3. **Cleanup**: Implement cleanup policies for old replicas
4. **Monitoring**: Set up alerts for storage usage

### Performance Optimization

1. **SSD Storage**: Use fast storage for better performance
2. **Local Storage**: Use local storage when possible for better I/O
3. **Compression**: Zero handles compression automatically
4. **Indexing**: Zero optimizes queries automatically

### Security

1. **Encryption**: Encrypt persistent volumes for sensitive data
2. **Access Control**: Use RBAC to limit access to volumes
3. **Network Policies**: Restrict network access to Zero services
4. **Audit Logging**: Monitor access to replica files

## 🔗 Related Documentation

- [Rocicorp Zero Documentation](https://zero.rocicorp.dev/)
- [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [OpenFaith Environment Configuration](./environment-configuration.md)
- [OpenFaith Client Sync](./ClientSync.md)
