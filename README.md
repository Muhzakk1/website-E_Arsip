# E-Arsip Dinas Pendidikan

Sistem pengelolaan arsip dokumen digital untuk Dinas Pendidikan. Dibangun dengan React + Vite (Frontend), Node.js + Express (Backend), dan Supabase (Database & Storage).

---

## 🛠️ Tech Stack

| Layer      | Teknologi                                              |
|------------|--------------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6, TanStack React Query, Axios |
| Backend    | Node.js, Express.js, JWT, bcryptjs, Multer             |
| Database   | Supabase (PostgreSQL)                                  |
| Storage    | Supabase Storage                                       |

---

## 📋 Fitur

- 🔐 Autentikasi JWT (Login/Logout)
- 📁 Manajemen folder (CRUD, subfolder)
- 📄 Upload & download dokumen (via Supabase Storage)
- 🔍 Pencarian dokumen
- 🗑️ Soft delete file
- 👥 Manajemen pegawai (admin only)
- 📊 Log aktivitas lengkap dengan filter & pagination
- 🎨 UI modern & responsive

---

## 🚀 Cara Setup

### 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan script SQL berikut untuk membuat tabel:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_enum AS ENUM ('pegawai', 'admin');
CREATE TYPE aksi_enum AS ENUM (
  'login','logout','upload_file','download_file',
  'hapus_file','cari_file','buat_folder','hapus_folder',
  'edit_profil','tambah_pegawai','nonaktifkan_pegawai'
);

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama           VARCHAR(150) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           role_enum NOT NULL DEFAULT 'pegawai',
  status         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE folders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama            VARCHAR(255) NOT NULL,
  parent_id       UUID REFERENCES folders(id) ON DELETE CASCADE,
  dibuat_oleh     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  dibuat_pada     TIMESTAMP NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE files (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_file        VARCHAR(255) NOT NULL,
  nama_asli        VARCHAR(255) NOT NULL,
  tipe_mime        VARCHAR(100) NOT NULL,
  ukuran_bytes     BIGINT NOT NULL,
  path_penyimpanan VARCHAR(500) NOT NULL,
  folder_id        UUID NOT NULL REFERENCES folders(id) ON DELETE RESTRICT,
  diunggah_oleh    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  diunggah_pada    TIMESTAMP NOT NULL DEFAULT NOW(),
  dihapus_pada     TIMESTAMP DEFAULT NULL
);

CREATE TABLE activity_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  aksi         aksi_enum NOT NULL,
  file_id      UUID REFERENCES files(id) ON DELETE SET NULL,
  keterangan   TEXT,
  ip_address   VARCHAR(45),
  terjadi_pada TIMESTAMP NOT NULL DEFAULT NOW()
);
```

3. Buat **Storage Bucket**:
   - Buka menu **Storage** di Supabase Dashboard
   - Klik **New Bucket**
   - Nama: `arsip-dokumen`
   - **Private bucket** (jangan centang public)

4. Buat admin pertama via SQL Editor:
```sql
-- Ganti password hash sesuai kebutuhan (ini = "admin123")
-- Generate hash di: https://bcrypt-generator.com/
INSERT INTO users (nama, email, password_hash, role)
VALUES ('Administrator', 'admin@dinas.go.id', '$2a$10$A9f2eWv.M5cteLnfbw8J3.vOLY9wMhmzwTkl3xAhwon2TLCwGIE6i', 'admin');
```

### 2. Setup Backend

```bash
cd earsip/backend

# Copy dan isi environment variables
cp .env.example .env
# Edit .env sesuai project Supabase kamu

# Install dependencies
npm install

# Jalankan server (development)
npm run dev
```

Variabel `.env` yang harus diisi:
- `SUPABASE_URL` → URL project Supabase (dari Settings > API)
- `SUPABASE_SERVICE_KEY` → Service Role Key (dari Settings > API > service_role)
- `JWT_SECRET` → String acak minimal 32 karakter
- `JWT_EXPIRES_IN` → Durasi token (default: 8h)

### 3. Setup Frontend

```bash
cd earsip/frontend

# Copy dan isi environment variables
cp .env.example .env
# Default: VITE_API_URL=http://localhost:5000/api

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

### 4. Akses Aplikasi

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📁 Struktur Project

```
earsip/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── middleware/auth.js
│   │   ├── middleware/roleGuard.js
│   │   ├── controllers/authController.js
│   │   ├── controllers/folderController.js
│   │   ├── controllers/fileController.js
│   │   ├── controllers/adminController.js
│   │   ├── routes/authRoutes.js
│   │   ├── routes/folderRoutes.js
│   │   ├── routes/fileRoutes.js
│   │   ├── routes/adminRoutes.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 📡 API Endpoints

| Method | Endpoint                    | Auth | Role  | Deskripsi              |
|--------|-----------------------------|------|-------|------------------------|
| POST   | /api/auth/login             | ❌   | -     | Login                  |
| GET    | /api/auth/me                | ✅   | -     | Get current user       |
| POST   | /api/auth/logout            | ✅   | -     | Logout                 |
| GET    | /api/folders                | ✅   | -     | Get all folders        |
| GET    | /api/folders/:id            | ✅   | -     | Get folder detail      |
| POST   | /api/folders                | ✅   | -     | Create folder          |
| DELETE | /api/folders/:id            | ✅   | Admin | Delete folder          |
| GET    | /api/files/search?q=        | ✅   | -     | Search files           |
| POST   | /api/files/upload           | ✅   | -     | Upload file            |
| GET    | /api/files/:id/download     | ✅   | -     | Download file          |
| DELETE | /api/files/:id              | ✅   | -     | Soft delete file       |
| GET    | /api/admin/users            | ✅   | Admin | Get all users          |
| POST   | /api/admin/users            | ✅   | Admin | Create user            |
| PATCH  | /api/admin/users/:id/status | ✅   | Admin | Toggle user status     |
| GET    | /api/admin/logs             | ✅   | Admin | Get activity logs      |

---

## 📝 Lisensi

Dibuat untuk keperluan Dinas Pendidikan. Hak cipta dilindungi.
