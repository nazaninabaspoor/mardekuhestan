# Marde Kuhestan — Backend Architecture

## Principle

Django owns business truth.  
FastAPI owns AI intelligence on top of that truth.  
No duplicated commerce logic in the AI service.

## Services

| Service | Responsibility | Port |
|---|---|---|
| Django + DRF | Catalog, accounts, inventory, orders, payments, logistics, content | 8000 |
| FastAPI | Assistant, recommendations, knowledge/RAG, automation | 8001 |
| PostgreSQL | System of record | 55432 |
| Redis | Cache + Celery results | 6379 |
| RabbitMQ | Task/work queue | 5672 / 15672 |
| Kafka | Domain event streaming | 9092 / UI 8088 |
| OpenSearch | Product & content search | 9200 / UI 5601 |
| Qdrant | Vector memory for AI | 6333 |
| MinIO | Media/object storage | 9010 / console 9011 |
| Nginx | Edge routing | 80 |

## Django domain apps

- `common` — shared base utilities
- `accounts` — identity & auth APIs
- `product` — products/categories (meat, dairy, seafood, ready meals, ...)
- `inventory` — stock & availability
- `orders` — cart & checkout flow
- `payments` — payment providers
- `logistics` — delivery & fulfillment
- `content` — SEO Studio: articles, categories/tags, pillar-cluster strategy, redirects, GEO/JSON-LD, sitemap, Unfold admin + public APIs
- `notifications` — SMS/email/push jobs
- `sec` — security helpers (rate limit, guards)

## FastAPI AI modules

- `assistant` — exclusive Marde Kuhestan AI agent
- `recommendations` — meal/basket suggestions using real catalog data
- `knowledge` — RAG over brand + product knowledge (Qdrant)
- `automation` — operational/marketing automations
- `integrations` — Django/OpenSearch/Qdrant/MinIO clients

## Request flow

```text
Client
  -> Nginx
      -> /api/*      Django (business)
      -> /ai/*       FastAPI (AI)
           -> tools/integrations -> Django APIs
           -> Qdrant / OpenSearch / Redis / Kafka
```

## Non-goals for AI service

- Not the source of product/order/user data
- Not a second checkout engine
- Not a generic ChatGPT wrapper without company data
