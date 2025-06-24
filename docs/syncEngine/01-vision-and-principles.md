# Vision and Principles: The Sync Engine

**⚠️ Implementation Status: The vision described in this document represents our long-term goals. Currently, we have implemented the foundational API adapter layer using `@openfaith/adapter-core` and `@openfaith/pco`. The full sync engine with durable workflows is planned but not yet implemented.**

## 1. Vision

Our vision is to create a **robust, resilient, and developer-friendly sync engine** capable of integrating with any third-party API, starting with Planning Center Online (PCO).

This engine will serve as the backbone for our data platform, ensuring that data from disparate systems is synchronized accurately, efficiently, and reliably. It will empower our products by providing a consistent and up-to-date view of our customers' data, while abstracting away the immense complexity of real-world API integrations.

## 2. The Problem

Synchronizing data from external systems is deceptively complex. A naive implementation quickly fails when faced with the realities of production environments. The challenges we must solve include:

*   **Large Datasets:** APIs often expose hundreds of thousands or even millions of records. Loading this data into memory is not an option.
*   **Rate Limiting:** Every API enforces rate limits. A robust system must gracefully handle these limits without failing or losing data.
*   **API Errors & Downtime:** External APIs can fail, go down for maintenance, or return unexpected errors. Our system must be resilient to these transient failures.
*   **Authentication & Authorization:** Managing API tokens, handling expired credentials, and respecting user permissions is a critical security and reliability concern.
*   **Complex Data Relationships:** Data is not flat. Syncing "People" might depend on "Households," and "Events" depend on "Groups." The engine must understand and respect these dependencies.
*   **Detecting Changes & Deletions:** Knowing when a record has been updated is one challenge; knowing when it has been *deleted* is another, often much harder, problem.

Our goal is to build a system that solves these hard problems once, in a generic way, so that individual developers don't have to.

## 3. Core Principles

These four principles guide every architectural decision we make. When faced with a choice, we will always favor the option that best aligns with these values.

### A. Resilience & Durability

The system must be built to withstand failure. Data integrity is paramount.

*   **Assume Failure:** We will design for failure, not as an afterthought. Network partitions, API downtime, and server restarts are expected events, not exceptions.
*   **Durable Execution:** Long-running sync processes will be durable. If a 10-hour sync fails at hour 9, it will resume from where it left off, not start from scratch.
*   **Idempotency:** Operations will be designed to be safely retryable. Creating the same record twice due to a network error should not result in duplicates.
*   **Atomic Operations:** State changes will be atomic wherever possible to avoid partial updates that leave the system in an inconsistent state.

### B. Observability

A system that you cannot see is a system that you cannot trust or debug.

*   **Structured Logging:** The engine will produce detailed, structured logs. An operator should be able to trace the entire lifecycle of a sync job or a single API request.
*   **Clear State:** The current state of the system—what's syncing, what has completed, what has failed—must be easily accessible and understandable.
*   **Metrics & Monitoring:** We will expose key metrics (e.g., records synced per second, API error rates, rate limit utilization) to allow for proactive monitoring and alerting.

### C. Developer Experience (DX)

The engine's power should not come at the cost of usability. We serve two kinds of developers: those using the system, and those contributing to it.

*   **Progressive Disclosure:** The API should be simple for simple use cases. A developer who just wants to fetch a single record should not need to understand the entire distributed system. Advanced features should be available but not required for basic tasks.
*   **Type Safety:** We will leverage modern TypeScript and schemas to provide strong static guarantees, catching bugs at compile time, not in production.
*   **Declarative Configuration:** Adding a new API or a new endpoint should be a declarative process—configuring what to do, not how to do it. The engine handles the "how."

### D. Decoupling & Composability

The system will be composed of small, focused, and independent components.

*   **Generic API Adapter:** The logic for interacting with a specific API (e.g., PCO) will be encapsulated in a standalone library. This library will be reusable and have no knowledge of our specific sync or database logic.
*   **Separate Sync Engine:** The business logic for orchestration, durability, and data transformation will live in a separate sync engine. This engine consumes the API adapter as a dependency.
*   **Pluggable Backends:** Core services like rate limiting and state storage will be designed around generic interfaces, allowing us to swap out implementations (e.g., from in-memory to Redis) without changing business logic.

## 4. Current Implementation Progress

We are building this system incrementally, with a focus on getting the foundational pieces right before adding complexity.

### ✅ **Phase 1: API Adapter Foundation (Completed)**
- **Type-safe HTTP Client**: Using Effect's HttpApiClient with full schema validation
- **Endpoint Definitions**: Declarative endpoint configuration with `pcoApiAdapter()`
- **Token Management**: Database-backed authentication with automatic refresh
- **PCO Integration**: Comprehensive coverage of PCO's People API
- **Effect Integration**: Native Effect-based architecture throughout

### 🚧 **Phase 2: Sync Engine Core (Planned)**
- **Durable Workflows**: Implementation using `@effect/cluster` and `@effect/workflow`
- **Generic Workflow Factory**: Automatic sync job generation from endpoint definitions
- **Multiple Sync Strategies**: Full, delta, reconciliation, and webhook-triggered syncs
- **Data Transformation**: Pipeline from API data to canonical internal models

### 🚧 **Phase 3: Advanced Features (Planned)**
- **Streaming Interfaces**: Efficient pagination with `streamPages()` and `streamAll()`
- **Rate Limiting**: Distributed rate limit management across cluster nodes
- **Advanced Error Handling**: Comprehensive retry strategies and error classification
- **Dependency Management**: Automatic sync ordering based on entity relationships

### 🚧 **Phase 4: Operations & Monitoring (Planned)**
- **Admin Dashboard**: Web interface for monitoring and managing sync jobs
- **Metrics & Alerting**: Comprehensive observability and operational tools
- **Performance Optimization**: Auto-scaling and load balancing capabilities

## 5. Why This Approach Works

The incremental approach allows us to:

1. **Validate Assumptions Early**: The API adapter layer lets us test our approach with real PCO data and real authentication challenges
2. **Build on Solid Foundations**: By getting the type safety and Effect integration right first, the sync engine will inherit these benefits
3. **Maintain Momentum**: Each phase delivers value independently, avoiding the "big bang" integration risk
4. **Learn and Adapt**: Real-world usage of each phase informs the design of the next

The current API adapter implementation already demonstrates several of our core principles in action: type safety through Effect Schema, declarative configuration through `pcoApiAdapter()`, and resilient authentication through the `TokenManager` service.

When the full sync engine is implemented, it will build upon this proven foundation to deliver the complete vision of a robust, resilient, and developer-friendly data synchronization platform.