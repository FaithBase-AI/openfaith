# Zero Architecture Clarification

This document clarifies how Rocicorp Zero is used across OpenFaith services and which services need the `ZERO_REPLICA_FILE` configuration.

## 🏗️ Zero Architecture Overview

OpenFaith uses Rocicorp Zero for client-side synchronization, but **only the frontend** acts as a Zero client. Backend services act as Zero servers.

### **Frontend (React App) - Zero Client** ✅

- **Role**: Zero client with local SQLite replica
- **Uses**: `ZeroProvider`, `ZeroInit`, local queries
- **Needs**: `ZERO_REPLICA_FILE` for local SQLite database
- **Purpose**: Instant UI responses, offline capability, optimistic updates

### **Backend API - Zero Server** ❌

- **Role**: Zero server handling push requests
- **Uses**: `zeroMutatorsHandler.ts` for processing mutations
- **Needs**: Database connections, NOT replica files
- **Purpose**: Process client mutations, trigger external sync workflows

### **Workers - Zero Server** ❌

- **Role**: Background sync workflows
- **Uses**: External sync workflows triggered by backend
- **Needs**: Database connections, NOT replica files
- **Purpose**: Sync data with external ChMS systems

### **Shard Manager - Cluster Coordinator** ❌

- **Role**: Cluster coordination for Effect workflows
- **Uses**: No direct Zero integration
- **Needs**: No Zero configuration
- **Purpose**: Coordinate distributed workflows

## 🔧 Configuration Strategy

### **Frontend Configuration**

```yaml
# k8s/frontend-configmap.yaml
ZERO_REPLICA_FILE: "/data/zero.db" # ✅ Frontend needs this
ZERO_UPSTREAM_DB: "postgresql://..."
ZERO_CVR_DB: "postgresql://..."
ZERO_CHANGE_DB: "postgresql://..."
```

### **Backend/Workers Configuration**

```yaml
# k8s/configmap.yaml
# ZERO_REPLICA_FILE: NOT INCLUDED  # ❌ Backend doesn't need this
ZERO_UPSTREAM_DB: "postgresql://..."
ZERO_CVR_DB: "postgresql://..."
ZERO_CHANGE_DB: "postgresql://..."
```

## 📊 Storage Requirements

### **Frontend Pods**

- **Persistent Volume**: 1GB for Zero replica file
- **Mount Point**: `/data/zero.db`
- **Access Mode**: `ReadWriteOnce` (each pod gets its own volume)

### **Backend/Workers Pods**

- **No Persistent Storage**: Only need database connections
- **Stateless**: Can be scaled horizontally without storage concerns

## 🔄 Data Flow

```
Frontend (Zero Client)
├── Local SQLite Replica (/data/zero.db)
├── Instant queries from local cache
├── Optimistic updates
└── Push mutations to Backend

Backend (Zero Server)
├── Receives mutations from Frontend
├── Processes mutations via zeroMutatorsHandler
├── Updates PostgreSQL database
└── Triggers Workers for external sync

Workers (Background Sync)
├── Receives sync triggers from Backend
├── Syncs with external ChMS systems
└── Updates PostgreSQL database
```

## 🚨 Common Misconceptions

### **❌ Wrong**: "All services need ZERO_REPLICA_FILE"

- **Reality**: Only frontend needs replica files
- **Why**: Backend services are Zero servers, not clients

### **❌ Wrong**: "Replica files keep services in sync"

- **Reality**: Replica files are local caches for instant UI responses
- **Why**: Services sync via PostgreSQL database, not replica files

### **❌ Wrong**: "Multiple pods share the same replica file"

- **Reality**: Each frontend pod has its own replica file
- **Why**: `ReadWriteOnce` volumes can only be mounted by one pod

## ✅ Correct Configuration

### **Frontend Deployment**

```yaml
# k8s/frontend.yaml
spec:
  template:
    spec:
      containers:
        - name: frontend
          envFrom:
            - configMapRef:
                name: openfaith-frontend-config # ✅ Includes ZERO_REPLICA_FILE
          volumeMounts:
            - name: zero-replica-storage
              mountPath: /data
      volumes:
        - name: zero-replica-storage
          persistentVolumeClaim:
            claimName: zero-replica-pvc
```

### **Backend Deployment**

```yaml
# k8s/backend.yaml
spec:
  template:
    spec:
      containers:
        - name: backend
          envFrom:
            - configMapRef:
                name: openfaith-config # ✅ No ZERO_REPLICA_FILE
          # No volume mounts needed
```

## 🎯 Key Takeaways

1. **Only Frontend Needs Replica Files**: Backend services are Zero servers, not clients
2. **Separate ConfigMaps**: Frontend gets `ZERO_REPLICA_FILE`, backend doesn't
3. **Single PVC**: Only one persistent volume needed for frontend replica files
4. **Stateless Backend**: Backend services can scale without storage concerns
5. **Client-Server Architecture**: Frontend is Zero client, backend is Zero server

## 🔗 Related Documentation

- [Zero Replica Storage](./zero-replica-storage.md)
- [Environment Configuration](./environment-configuration.md)
- [Client Sync Architecture](./ClientSync.md)
