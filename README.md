# مرد کوهستان (Marde Kuhestan)

پلتفرم برند و فروش صنایع غذایی مرد کوهستان.

## معماری سریع

- **Django** = مغز کسب‌وکار (محصول، سفارش، موجودی، پرداخت، محتوا)
- **FastAPI** = هوش مصنوعی اختصاصی مرد کوهستان
- جزئیات کامل: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## ساختار روت

```text
backend/django     Business API
backend/fastapi    AI service
frontend           Web/UI (next)
nginx              Edge proxy
docker-compose.yml Infra (Postgres/Redis/RabbitMQ/Kafka/OpenSearch/Qdrant/MinIO)
docs               Architecture notes
postman            API collections
```

## زیرساخت

```powershell
cd C:\Users\kamyar\Desktop\MardeKoohestan
docker compose up -d
docker compose ps
```

## Django

```powershell
cd backend\django
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

## FastAPI

```powershell
cd backend\fastapi
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Health: `http://127.0.0.1:8001/api/v1/health`

## امنیت

- فقط `.env.example` در گیت
- `.env` و `venv` و دیتابیس لوکال commit نشوند
