# CrediTOR Spring Boot API

REST API for the CrediTOR frontend at `http://localhost:8080/api`.

Database: **Supabase (PostgreSQL)**.

## 1. Supabase setup

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Project Settings → Database**.
3. Copy the **database password** (or reset it).
4. Under **Connection string**, choose **URI** (Session mode, port **5432**) or **Direct connection**.
5. Build your JDBC URL:

```properties
jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

If Supabase shows a pooler host on port **6543**, you can use that instead for serverless/pooling:

```properties
jdbc:postgresql://aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require
```

## 2. Configure backend

```bash
cd backend/creditor/creditor
copy .env.example .env
```

Edit `.env`:

```env
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_database_password
CREDITOR_JWT_SECRET=your-long-random-secret
```

## 3. Run

```bash
.\mvnw.cmd spring-boot:run
```

On first run, Hibernate creates/updates tables (`ddl-auto=update`).  
Optionally run `src/main/resources/schema.sql` in the Supabase SQL Editor first.

## 4. Default registrar (auto-seeded)

- **Email:** `registrar@creditor.test`
- **Password:** `TestPassword123!`

## 5. Frontend

In `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

## QR photo verification (OCR.space)

TOR photos scanned from a QR code are sent to **OCR.space** on the server. Extracted text is matched against the registrar record (student ID, name, date issued).

Get a free API key: [ocr.space/ocrapi/freekey](https://ocr.space/ocrapi/freekey)

```powershell
$env:OCR_SPACE_API_KEY="your_ocr_space_key_here"
.\mvnw.cmd spring-boot:run
```

Or copy `application-local.properties.example` to `application-local.properties` and set `creditor.ocrspace.api-key=...` (gitignored).

## Local dev without Supabase

```bash
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

Uses embedded H2 in `./data/creditor` (not for production).

## PDF files

Uploaded PDFs are stored on disk under `./uploads`.  
To use **Supabase Storage** later, the file upload service can be extended to call the Supabase Storage API.
