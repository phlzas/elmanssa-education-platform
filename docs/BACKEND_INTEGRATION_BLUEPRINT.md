# Elmanssa Education Platform — Backend Integration Blueprint

> **Version:** 1.0  
> **Date:** 2026-02-25  
> **Stack Recommendation:** Node.js + Express.js + PostgreSQL + JWT  
> **API Base URL:** `https://api.elmanssa.com/api/v1`

---

## Table of Contents

1. [UI & Data Mapping](#1-ui--data-mapping)
2. [Data Modeling & Database Schema](#2-data-modeling--database-schema)
3. [RESTful API Design](#3-restful-api-design)
4. [Server Integration Guide](#4-server-integration-guide)
5. [Frontend Integration Notes](#5-frontend-integration-notes)

---

## 1. UI & Data Mapping

### 1.1 Pages & Components Inventory

| Page | Key Components | Data Entities | CRUD Operations |
|---|---|---|---|
| **Home** | Hero, Stats, Features, PopularCourses, Testimonials, TeacherCTA | Courses, Stats, Testimonials | R |
| **Courses** | CourseCard list, Search, Category filter, Level filter, Price filter | Courses, Categories | R |
| **Course Detail** | Course info, Curriculum, Reviews, Instructor card, Enroll CTA | Courses, Curriculum, Reviews, Instructors | R |
| **Signup** | Account type toggle (student/teacher), Name, Email, Password | Users | C |
| **Login** | Email, Password | Auth Sessions | C |
| **Student Dashboard** | Sidebar nav, Enrolled subjects, Levels/Lectures tree, Progress | Enrollments, Subjects, Levels, Lectures, Progress | R, U |
| **Teacher Dashboard** | Stats cards, Subject CRUD, Level/Lecture management, Students list, Analytics | Subjects, Levels, Lectures, Students, Analytics | C, R, U, D |
| **Video Viewer** | Video player, Sidebar curriculum, Progress tracking, Next/Prev navigation | Lectures, Progress | R, U |
| **Checkout** | 3-step form (Personal → Payment → Confirm), Coupon, Order summary | Orders, Payments, Coupons | C, R |
| **Payment Success** | Order confirmation, Course info, Next steps | Orders | R |
| **Instructor Profile** | Bio, Courses, Reviews, Stats, Social links | Instructors, Courses, Reviews | R |
| **Live Stream** | Video embed, Chat messages, Upcoming schedule | LiveStreams, ChatMessages | R, C |
| **AI Assistant** | Chat interface, Message history | AIConversations, Messages | C, R |
| **Contact** | Form (name, email, type, subject, message) | ContactMessages | C |
| **Pricing** | Plan cards (Free, Pro, Business) | SubscriptionPlans | R |
| **Blog** | Article cards | BlogPosts | R |
| **About** | Team info, Mission, Statistics | StaticContent | R |
| **Support/Privacy** | FAQ, Help content, Policy text | StaticContent | R |

### 1.2 Entity Relationship Summary

```
Users ──< Enrollments >── Courses
Users (teacher) ──< Subjects >──< Levels >──< Lectures
Users ──< Orders >── Courses
Users ──< Reviews >── Courses
Users ──< ChatMessages >── LiveStreams
Users ──< AIConversations >──< AIMessages
Users ──< ContactMessages
Courses ──< CurriculumSections >──< CurriculumLectures
SubscriptionPlans (standalone)
Coupons (standalone)
BlogPosts (standalone)
```

---

## 2. Data Modeling & Database Schema

### 2.1 Core Entities

#### `users`
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    avatar_url    TEXT,
    phone         VARCHAR(20),
    bio           TEXT,
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### `courses` (marketplace/catalog courses)
```sql
CREATE TABLE courses (
    id             SERIAL PRIMARY KEY,
    title          VARCHAR(500) NOT NULL,
    description    TEXT,
    category       VARCHAR(100) NOT NULL,
    instructor_id  UUID NOT NULL REFERENCES users(id),
    rating         DECIMAL(2,1) DEFAULT 0,
    duration       INTEGER NOT NULL,            -- hours
    lectures_count INTEGER DEFAULT 0,
    level          VARCHAR(50) DEFAULT 'مبتدئ',
    language       VARCHAR(50) DEFAULT 'العربية',
    students_count INTEGER DEFAULT 0,
    price          DECIMAL(10,2) NOT NULL,       -- 0 = free
    image_url      TEXT,
    status         VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
    last_updated   TIMESTAMPTZ DEFAULT NOW(),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
```

#### `curriculum_sections`
```sql
CREATE TABLE curriculum_sections (
    id          SERIAL PRIMARY KEY,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sections_course ON curriculum_sections(course_id);
```

#### `curriculum_lectures`
```sql
CREATE TABLE curriculum_lectures (
    id           SERIAL PRIMARY KEY,
    section_id   INTEGER NOT NULL REFERENCES curriculum_sections(id) ON DELETE CASCADE,
    title        VARCHAR(500) NOT NULL,
    duration     VARCHAR(20),
    video_url    TEXT,
    is_preview   BOOLEAN DEFAULT false,
    sort_order   INTEGER DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subjects` (teacher-managed content)
```sql
CREATE TABLE subjects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id    UUID NOT NULL REFERENCES users(id),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    icon          VARCHAR(10) DEFAULT '📚',
    students_count INTEGER DEFAULT 0,
    status        VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published')),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subjects_teacher ON subjects(teacher_id);
```

#### `levels`
```sql
CREATE TABLE levels (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `lectures`
```sql
CREATE TABLE lectures (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id    UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    duration    VARCHAR(20) DEFAULT '00:00',
    video_url   TEXT,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `enrollments`
```sql
CREATE TABLE enrollments (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id),
    course_id   INTEGER REFERENCES courses(id),
    subject_id  UUID REFERENCES subjects(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id),
    UNIQUE(user_id, subject_id)
);
```

#### `lecture_progress`
```sql
CREATE TABLE lecture_progress (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id),
    lecture_id      UUID NOT NULL REFERENCES lectures(id),
    completed       BOOLEAN DEFAULT false,
    progress_pct    INTEGER DEFAULT 0,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lecture_id)
);
```

#### `orders`
```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(50) NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id),
    course_id       INTEGER NOT NULL REFERENCES courses(id),
    original_price  DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_price     DECIMAL(10,2) NOT NULL,
    coupon_id       INTEGER REFERENCES coupons(id),
    payment_method  VARCHAR(20) NOT NULL CHECK (payment_method IN ('card','wallet','bank')),
    payment_status  VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','completed','failed','refunded')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user ON orders(user_id);
```

#### `coupons`
```sql
CREATE TABLE coupons (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    discount_pct    DECIMAL(5,2) NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    max_uses        INTEGER,
    current_uses    INTEGER DEFAULT 0,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_coupons_code ON coupons(code);
```

#### `reviews`
```sql
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id),
    course_id   INTEGER NOT NULL REFERENCES courses(id),
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);
```

#### `contact_messages`
```sql
CREATE TABLE contact_messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    type        VARCHAR(50) DEFAULT 'general',
    subject     VARCHAR(500),
    message     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `live_streams`
```sql
CREATE TABLE live_streams (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(500) NOT NULL,
    instructor_id UUID NOT NULL REFERENCES users(id),
    stream_url    TEXT,
    scheduled_at  TIMESTAMPTZ NOT NULL,
    duration_mins INTEGER,
    status        VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended')),
    viewer_count  INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `chat_messages`
```sql
CREATE TABLE chat_messages (
    id          SERIAL PRIMARY KEY,
    stream_id   INTEGER NOT NULL REFERENCES live_streams(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ai_conversations`
```sql
CREATE TABLE ai_conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ai_messages`
```sql
CREATE TABLE ai_messages (
    id              SERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id),
    sender          VARCHAR(10) NOT NULL CHECK (sender IN ('user','ai')),
    text            TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `blog_posts`
```sql
CREATE TABLE blog_posts (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    excerpt     TEXT,
    content     TEXT NOT NULL,
    image_url   TEXT,
    author_id   UUID REFERENCES users(id),
    tags        TEXT[],
    status      VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subscription_plans`
```sql
CREATE TABLE subscription_plans (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    price_monthly   DECIMAL(10,2) NOT NULL,
    features        JSONB NOT NULL,
    is_popular      BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0
);
```

#### `testimonials`
```sql
CREATE TABLE testimonials (
    id          SERIAL PRIMARY KEY,
    user_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(100),
    avatar_url  TEXT,
    text        TEXT NOT NULL,
    rating      INTEGER DEFAULT 5,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. RESTful API Design

### 3.1 Standardized Response Formats

**Success:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "per_page": 20, "total": 100 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "البريد الإلكتروني مطلوب",
    "details": [{ "field": "email", "message": "required" }]
  }
}
```

### 3.2 Authentication Endpoints

#### `POST /api/v1/auth/signup`
- **Auth:** Public
- **Body:**
```json
{
  "name": "عمر أحمد",
  "email": "omar@example.com",
  "password": "SecureP@ss1",
  "role": "student"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "عمر أحمد", "email": "omar@example.com", "role": "student" },
    "token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```
- **Validation:** name (3-100 chars), email (valid format, unique), password (≥8, uppercase, number), role (student|teacher)
- **Errors:** 400 (validation), 409 (email exists)

#### `POST /api/v1/auth/login`
- **Auth:** Public
- **Body:**
```json
{ "email": "omar@example.com", "password": "SecureP@ss1" }
```
- **Response (200):** Same structure as signup
- **Errors:** 400 (validation), 401 (invalid credentials)

#### `POST /api/v1/auth/logout`
- **Auth:** Bearer Token
- **Response (200):** `{ "success": true, "data": { "message": "تم تسجيل الخروج" } }`

#### `POST /api/v1/auth/refresh`
- **Body:** `{ "refresh_token": "..." }`
- **Response (200):** new token pair

#### `GET /api/v1/auth/me`
- **Auth:** Bearer Token
- **Response (200):** `{ "success": true, "data": { "user": {...} } }`

#### `PATCH /api/v1/auth/me`
- **Auth:** Bearer Token
- **Body:** `{ "name": "...", "avatar_url": "..." }`
- **Response (200):** updated user

---

### 3.3 Courses (Marketplace)

#### `GET /api/v1/courses`
- **Auth:** Public
- **Query:** `?page=1&per_page=12&category=التصميم&level=مبتدئ&price=free|paid&sort=rating|newest|popular&search=ويب`
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1, "title": "...", "category": "تطوير البرمجيات",
      "instructor": { "id": "uuid", "name": "أحمد العلي" },
      "rating": 4.8, "duration": 45, "students_count": 3500,
      "price": 450, "image_url": "...", "level": "متوسط", "status": "published"
    }
  ],
  "meta": { "page": 1, "per_page": 12, "total": 48 }
}
```

#### `GET /api/v1/courses/:id`
- **Auth:** Public
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1, "title": "...", "description": "...", "category": "...",
    "instructor": { "id": "uuid", "name": "...", "bio": "...", "avatar_url": "..." },
    "rating": 4.8, "duration": 45, "lectures_count": 120,
    "level": "متوسط", "language": "العربية", "students_count": 3500,
    "price": 450, "image_url": "...",
    "features": ["..."], "requirements": ["..."], "learning_points": ["..."],
    "curriculum": [
      { "section": "المقدمة", "lectures": ["ترحيب", "نظرة عامة"] }
    ],
    "last_updated": "2026-01-15"
  }
}
```
- **Errors:** 404 (not found)

#### `GET /api/v1/courses/:id/reviews`
- **Auth:** Public
- **Query:** `?page=1&per_page=10`
- **Response (200):** array of reviews with user name/avatar

#### `POST /api/v1/courses/:id/reviews`
- **Auth:** Bearer Token (student, enrolled only)
- **Body:** `{ "rating": 5, "comment": "شرح ممتاز" }`
- **Response (201):** created review
- **Errors:** 400, 401, 403 (not enrolled), 409 (already reviewed)

---

### 3.4 Teacher Subjects (Teacher Dashboard)

#### `GET /api/v1/teacher/subjects`
- **Auth:** Bearer Token (teacher)
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "name": "الكيمياء", "description": "...", "icon": "🧪",
      "students_count": 45, "status": "published", "created_at": "2026-01-10",
      "levels": [
        {
          "id": "uuid", "name": "المستوى 1",
          "lectures": [
            { "id": "uuid", "title": "مقدمة", "duration": "15:30", "video_url": "..." }
          ]
        }
      ]
    }
  ]
}
```

#### `POST /api/v1/teacher/subjects`
- **Auth:** Bearer Token (teacher)
- **Body:**
```json
{
  "name": "الفيزياء",
  "description": "مادة الفيزياء للمرحلة الثانوية",
  "icon": "⚡",
  "levels": [
    {
      "name": "المستوى 1",
      "lectures": [
        { "title": "الحركة", "duration": "20:00", "video_url": "https://..." }
      ]
    }
  ]
}
```
- **Response (201):** created subject with all nested data

#### `PUT /api/v1/teacher/subjects/:id`
- **Auth:** Bearer Token (teacher, owner)
- **Body:** same as POST
- **Response (200):** updated subject
- **Errors:** 403 (not owner), 404

#### `DELETE /api/v1/teacher/subjects/:id`
- **Auth:** Bearer Token (teacher, owner)
- **Response (200):** `{ "success": true, "data": { "message": "تم الحذف" } }`

#### `PATCH /api/v1/teacher/subjects/:id/publish`
- **Auth:** Bearer Token (teacher, owner)
- **Body:** `{ "status": "published" }` or `{ "status": "draft" }`
- **Response (200):** updated subject

#### `GET /api/v1/teacher/stats`
- **Auth:** Bearer Token (teacher)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "total_subjects": 5,
    "total_students": 234,
    "total_lectures": 89,
    "published_count": 3,
    "recent_activities": [
      { "type": "enrollment", "student_name": "...", "subject_name": "...", "timestamp": "..." }
    ]
  }
}
```

#### `GET /api/v1/teacher/students`
- **Auth:** Bearer Token (teacher)
- **Query:** `?page=1&per_page=20&search=أحمد`
- **Response (200):** paginated student list with enrollment info

---

### 3.5 Student Dashboard & Progress

#### `GET /api/v1/student/enrollments`
- **Auth:** Bearer Token (student)
- **Response (200):** enrolled subjects with levels, lectures, and completion status

#### `GET /api/v1/student/progress`
- **Auth:** Bearer Token (student)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "total_courses": 3,
    "completed_lectures": 45,
    "total_lectures": 89,
    "overall_progress": 50.5,
    "subjects": [
      { "id": "uuid", "name": "...", "progress": 75.0, "last_accessed": "..." }
    ]
  }
}
```

#### `POST /api/v1/student/progress`
- **Auth:** Bearer Token (student)
- **Body:** `{ "lecture_id": "uuid", "completed": true, "progress_pct": 100 }`
- **Response (200):** updated progress

---

### 3.6 Orders & Payments

#### `POST /api/v1/orders`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "course_id": 1,
  "payment_method": "card",
  "coupon_code": "ELMANSSA15",
  "billing": { "full_name": "عمر", "email": "omar@e.com", "phone": "01012345678" },
  "card": { "number": "4111111111111111", "expiry": "12/28", "cvc": "123", "holder": "OMAR" }
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid", "order_number": "ELM-12345678",
    "payment_status": "completed", "final_price": 382.50,
    "course": { "id": 1, "title": "..." }
  }
}
```
- **Errors:** 400 (validation), 402 (payment failed)

#### `GET /api/v1/orders/:id`
- **Auth:** Bearer Token (owner)

#### `POST /api/v1/coupons/validate`
- **Auth:** Bearer Token
- **Body:** `{ "code": "ELMANSSA15", "course_id": 1 }`
- **Response (200):**
```json
{ "success": true, "data": { "valid": true, "discount_pct": 15 } }
```

---

### 3.7 Live Streams

#### `GET /api/v1/streams`
- **Auth:** Public
- **Query:** `?status=live|scheduled`
- **Response (200):** list of streams with instructor info

#### `GET /api/v1/streams/:id`
- **Auth:** Bearer Token
- **Response (200):** stream detail with chat history

#### `POST /api/v1/streams/:id/chat`
- **Auth:** Bearer Token
- **Body:** `{ "message": "شرح رائع!" }`
- **Response (201):** created message
- **Note:** Production should use WebSocket (`ws://api.elmanssa.com/ws/streams/:id/chat`)

---

### 3.8 AI Assistant

#### `POST /api/v1/ai/conversations`
- **Auth:** Bearer Token
- **Response (201):** `{ "data": { "conversation_id": "uuid" } }`

#### `POST /api/v1/ai/conversations/:id/messages`
- **Auth:** Bearer Token
- **Body:** `{ "text": "ما هي أساسيات البرمجة؟" }`
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "user_message": { "id": 1, "sender": "user", "text": "..." },
    "ai_response": { "id": 2, "sender": "ai", "text": "..." }
  }
}
```

---

### 3.9 Contact Messages

#### `POST /api/v1/contact`
- **Auth:** Public
- **Body:**
```json
{
  "name": "سارة", "email": "sara@e.com",
  "type": "technical", "subject": "مشكلة في الفيديو", "message": "..."
}
```
- **Response (201):** `{ "success": true, "data": { "message": "تم إرسال رسالتك بنجاح" } }`

---

### 3.10 Instructors

#### `GET /api/v1/instructors/:id`
- **Auth:** Public
- **Response (200):** instructor profile with stats, courses, reviews, social links

---

### 3.11 Static Content

#### `GET /api/v1/plans` — subscription plans
#### `GET /api/v1/blog` — blog posts (`?page=1&per_page=10`)
#### `GET /api/v1/blog/:id` — single post
#### `GET /api/v1/testimonials` — active testimonials
#### `GET /api/v1/stats` — platform stats (students count, courses count, etc.)

---

## 4. Server Integration Guide

### 4.1 Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL pool/Knex/Prisma
│   │   ├── env.ts               # Environment variable validation
│   │   └── cors.ts              # CORS configuration
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── authorize.ts         # Role-based access (student, teacher, admin)
│   │   ├── validate.ts          # Zod/Joi request validation
│   │   ├── rateLimiter.ts       # express-rate-limit
│   │   ├── errorHandler.ts      # Global error handler
│   │   └── logger.ts            # Morgan/Winston request logging
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── courses/
│   │   │   ├── courses.routes.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   └── courses.validation.ts
│   │   ├── teacher/
│   │   │   ├── teacher.routes.ts
│   │   │   ├── teacher.controller.ts
│   │   │   ├── teacher.service.ts
│   │   │   └── teacher.validation.ts
│   │   ├── student/             # enrollments, progress
│   │   ├── orders/              # checkout, payments
│   │   ├── streams/             # live streams, chat
│   │   ├── ai/                  # AI assistant
│   │   ├── contact/             # contact form
│   │   ├── content/             # blog, plans, testimonials, stats
│   │   └── instructors/         # instructor profiles
│   ├── models/                  # Prisma schema or Knex models
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── hash.ts              # bcrypt
│   │   ├── pagination.ts
│   │   └── apiResponse.ts       # Standardized response helpers
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Entry point
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

### 4.2 Request Lifecycle

```
Client Request
  → CORS middleware
  → Rate Limiter
  → Logger (morgan)
  → JSON Body Parser
  → Auth middleware (JWT decode, attach req.user)
  → Authorize middleware (role check)
  → Validation middleware (Zod schema)
  → Controller (route handler)
    → Service (business logic)
      → Model/Repository (DB query)
    ← Response builder
  → Error Handler (catch-all)
  ← JSON Response to Client
```

### 4.3 Environment Configuration (`.env`)

```env
# Server
PORT=5000
NODE_ENV=production
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/elmanssa

# JWT
JWT_SECRET=<64-char-random>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<64-char-random>
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=https://elmanssa.com,https://www.elmanssa.com

# File Storage
CLOUDINARY_URL=cloudinary://key:secret@cloud
UPLOAD_MAX_SIZE=50MB

# AI (for AI assistant)
OPENAI_API_KEY=sk-...

# Payment Gateway
PAYMENT_SECRET_KEY=sk_live_...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4.4 Security Best Practices

| Concern | Implementation |
|---|---|
| Password Hashing | bcrypt with salt rounds = 12 |
| JWT | httpOnly cookie + short-lived access tokens (15m) + refresh tokens |
| Rate Limiting | 100 req/15min general, 5 req/15min for auth endpoints |
| Input Sanitization | express-validator / Zod + DOMPurify for text fields |
| CORS | Whitelist production domains only |
| HTTPS | Enforce via reverse proxy (nginx) |
| SQL Injection | Parameterized queries (Prisma/Knex) |
| Helmet | HTTP headers hardening |
| File Upload | Type validation, size limits, virus scanning |

### 4.5 API Versioning

- URL-based: `/api/v1/...`
- All routes mounted under `app.use('/api/v1', v1Router)`
- Future versions: `/api/v2/...` with backward compatibility

---

## 5. Frontend Integration Notes

### 5.1 API Client Setup

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.elmanssa.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // for httpOnly cookies
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → refresh token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {
          refresh_token: localStorage.getItem('refresh_token'),
        });
        localStorage.setItem('access_token', data.data.token);
        error.config.headers.Authorization = `Bearer ${data.data.token}`;
        return api(error.config);
      } catch { /* redirect to login */ }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5.2 Component-to-Endpoint Mapping

| Component | Endpoint | Method | Notes |
|---|---|---|---|
| `AuthContext.login()` | `/auth/login` | POST | Store tokens, redirect by role |
| `AuthContext.signup()` | `/auth/signup` | POST | Store tokens, redirect by role |
| `AuthContext` init | `/auth/me` | GET | Validate stored token on mount |
| `CoursesPage` | `/courses` | GET | Pass filters as query params |
| `CourseDetailPage` | `/courses/:id` | GET | Fetch on mount with courseId prop |
| `CourseDetailPage` reviews | `/courses/:id/reviews` | GET | Paginated, load more button |
| `CheckoutPage` coupon | `/coupons/validate` | POST | On "تطبيق" button click |
| `CheckoutPage` submit | `/orders` | POST | On payment submit |
| `PaymentSuccessPage` | `/orders/:id` | GET | Fetch order details |
| `StudentDashboard` | `/student/enrollments` | GET | Fetch enrolled subjects |
| `VideoViewer` progress | `/student/progress` | POST | On lecture complete/video end |
| `TeacherDashboard` subjects | `/teacher/subjects` | GET | Fetch on mount |
| `TeacherDashboard` stats | `/teacher/stats` | GET | Fetch dashboard stats |
| `SubjectModal` create | `/teacher/subjects` | POST | On save button |
| `SubjectModal` edit | `/teacher/subjects/:id` | PUT | On save (editing mode) |
| `TeacherDashboard` delete | `/teacher/subjects/:id` | DELETE | On delete confirm |
| `TeacherDashboard` publish | `/teacher/subjects/:id/publish` | PATCH | Toggle publish/draft |
| `TeacherDashboard` students | `/teacher/students` | GET | Students tab |
| `LiveStreamPage` | `/streams` | GET | Fetch current + upcoming |
| `LiveStreamPage` chat | `/streams/:id/chat` | POST | Send message (or WebSocket) |
| `AIPage` | `/ai/conversations/:id/messages` | POST | Send message, get AI response |
| `ContactPage` | `/contact` | POST | On form submit |
| `InstructorProfile` | `/instructors/:id` | GET | Fetch profile |
| `PricingPage` | `/plans` | GET | Fetch plan data |
| `BlogPage` | `/blog` | GET | Fetch posts |
| `Testimonials` | `/testimonials` | GET | Fetch on home page mount |
| `Stats` | `/stats` | GET | Platform-wide statistics |

### 5.3 Example: Replacing Mock Data in AuthContext

```typescript
// contexts/AuthContext.tsx — replace mock login with real API call

const login = useCallback(async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  const { user, token, refresh_token } = data.data;
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refresh_token);
  setUser(user);
}, []);

const signup = useCallback(async (name: string, email: string, password: string, role: AccountType) => {
  const { data } = await api.post('/auth/signup', { name, email, password, role });
  const { user, token, refresh_token } = data.data;
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refresh_token);
  setUser(user);
}, []);
```

### 5.4 Example: Replacing Mock Courses

```typescript
// components/CoursesPage.tsx

const [courses, setCourses] = useState<Course[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses', {
        params: { category: selectedCategory, level: selectedLevel, search: searchQuery, page }
      });
      setCourses(data.data);
      setTotalPages(Math.ceil(data.meta.total / data.meta.per_page));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  fetchCourses();
}, [selectedCategory, selectedLevel, searchQuery, page]);
```

### 5.5 Example: Teacher Subject CRUD

```typescript
// TeacherDashboard.tsx

// Fetch
useEffect(() => {
  api.get('/teacher/subjects').then(({ data }) => setSubjects(data.data));
  api.get('/teacher/stats').then(({ data }) => setStats(data.data));
}, []);

// Create
const saveSubject = async () => {
  const payload = { name: newSubjectName, description: newSubjectDesc, icon: newSubjectIcon, levels: newLevels };
  if (editingSubject) {
    const { data } = await api.put(`/teacher/subjects/${editingSubject.id}`, payload);
    setSubjects(subjects.map(s => s.id === editingSubject.id ? data.data : s));
  } else {
    const { data } = await api.post('/teacher/subjects', payload);
    setSubjects([...subjects, data.data]);
  }
  setShowCreateModal(false);
};

// Delete
const deleteSubject = async (id: string) => {
  await api.delete(`/teacher/subjects/${id}`);
  setSubjects(subjects.filter(s => s.id !== id));
};

// Toggle Publish
const togglePublish = async (id: string) => {
  const subj = subjects.find(s => s.id === id);
  const newStatus = subj?.status === 'published' ? 'draft' : 'published';
  await api.patch(`/teacher/subjects/${id}/publish`, { status: newStatus });
  setSubjects(subjects.map(s => s.id === id ? { ...s, status: newStatus } : s));
};
```

---

## Appendix: Quick Reference — All Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/auth/signup` | — | — |
| POST | `/auth/login` | — | — |
| POST | `/auth/logout` | Token | Any |
| POST | `/auth/refresh` | — | — |
| GET | `/auth/me` | Token | Any |
| PATCH | `/auth/me` | Token | Any |
| GET | `/courses` | — | — |
| GET | `/courses/:id` | — | — |
| GET | `/courses/:id/reviews` | — | — |
| POST | `/courses/:id/reviews` | Token | Student |
| GET | `/teacher/subjects` | Token | Teacher |
| POST | `/teacher/subjects` | Token | Teacher |
| PUT | `/teacher/subjects/:id` | Token | Teacher |
| DELETE | `/teacher/subjects/:id` | Token | Teacher |
| PATCH | `/teacher/subjects/:id/publish` | Token | Teacher |
| GET | `/teacher/stats` | Token | Teacher |
| GET | `/teacher/students` | Token | Teacher |
| GET | `/student/enrollments` | Token | Student |
| GET | `/student/progress` | Token | Student |
| POST | `/student/progress` | Token | Student |
| POST | `/orders` | Token | Any |
| GET | `/orders/:id` | Token | Owner |
| POST | `/coupons/validate` | Token | Any |
| GET | `/streams` | — | — |
| GET | `/streams/:id` | Token | Any |
| POST | `/streams/:id/chat` | Token | Any |
| POST | `/ai/conversations` | Token | Any |
| POST | `/ai/conversations/:id/messages` | Token | Any |
| POST | `/contact` | — | — |
| GET | `/instructors/:id` | — | — |
| GET | `/plans` | — | — |
| GET | `/blog` | — | — |
| GET | `/blog/:id` | — | — |
| GET | `/testimonials` | — | — |
| GET | `/stats` | — | — |

---

*End of Blueprint*
