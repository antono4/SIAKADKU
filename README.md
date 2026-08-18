# SIAKAD Terpadu v2 — Modern Edition

Sistem Informasi Akademik Terpadu (SIAKAD) versi modern dari proyek asli
[`nitinegoro/siakad-terpadu`](https://github.com/nitinegoro/siakad-terpadu)
(yang berbasis CodeIgniter 3 + AdminLTE + MySQL) — ditulis ulang dengan tumpukan
teknologi terkini: **NestJS + Next.js + PostgreSQL + Prisma + TypeScript**.

Proyek ini mempertahankan domain akademik asli (NPM, KRS, KHS, IPS/IPK, entry
nilai, verifikasi KRS, jadwal kuliah) namun dirombak total dengan arsitektur
modular, REST API berdokumentasi Swagger, autentikasi JWT, dan UI modern
responsif berbasis React + Tailwind.

## ✨ Apa yang baru vs versi asli

| Aspek | Versi asli (siakad-terpadu) | Versi v2 (ini) |
| --- | --- | --- |
| Backend | CodeIgniter 3 (PHP, MVC) | NestJS (TypeScript, modular) |
| Database | MySQL, query builder CI | PostgreSQL + Prisma ORM (type-safe) |
| Frontend | Server-rendered PHP + AdminLTE + jQuery | Next.js App Router + React + Tailwind |
| API | Tidak ada (view-driven) | REST API + OpenAPI/Swagger docs |
| Auth | Session + captcha, satu tipe user | JWT (access+refresh) + RBAC 4 peran |
| Validasi | Form validation CI | Zod schema validation |
| Deployment | Manual (htdocs) | Docker Compose (postgres + api + web) |
| Pengujian tipe | — | TypeScript strict end-to-end |

## 🧱 Arsitektur

```
siakad-terpadu-v2/
├── apps/
│   ├── backend/            # NestJS REST API (port 4000)
│   │   ├── src/modules/   # auth, users, students, lecturers, courses,
│   │   │                  # schedules, krs, grades, khs, dashboard,
│   │   │                  # academic-years, master, settings
│   │   └── prisma/        # schema.prisma + seed.ts
│   └── frontend/          # Next.js App Router (port 3000)
│       └── app/
│           ├── login/      # halaman login
│           └── (dashboard)/ # route group terproteksi
│               ├── admin/   # peran admin & akademik
│               ├── dosen/   # peran dosen
│               └── mahasiswa/ # peran mahasiswa
├── packages/shared/       # tipe & enum domain (dipakai FE + BE)
├── docker-compose.yml
└── turbo.json
```

## 🔐 Peran pengguna (RBAC)

- **Administrator** — kelola pengguna & seluruh data.
- **Bagian Akademik** — master data, jadwal, verifikasi KRS, entry nilai, tahun ajaran, pengaturan.
- **Dosen** — dashboard mengajar, mahasiswa bimbingan, entry nilai.
- **Mahasiswa** — dashboard, KRS, jadwal, KHS, transkrip.

## 🚀 Menjalankan dengan Docker (rekomendasi)

```bash
# 1. Siapkan variabel lingkungan
cp apps/backend/.env.example apps/backend/.env

# 2. Build & jalankan semua layanan
docker compose up -d --build

# 3. Isi data awal (seed)
docker compose exec backend pnpm db:seed
```

Akses:
- Frontend: http://localhost:3000
- API + Swagger docs: http://localhost:4000/api/docs

## 🛠️ Menjalankan secara lokal (pengembangan)

Prasyarat: Node.js ≥ 20, pnpm (`corepack enable`), PostgreSQL.

```bash
# 1. Install dependency monorepo
pnpm install

# 2. Konfigurasi env backend (sesuaikan DATABASE_URL)
cp apps/backend/.env.example apps/backend/.env

# 3. Generate Prisma client & jalankan migrasi
pnpm --filter backend db:generate
pnpm --filter backend exec prisma migrate dev -- --name init

# 4. Isi data awal
pnpm --filter backend db:seed

# 5. Jalankan backend & frontend (di terminal terpisah)
pnpm --filter backend dev      # http://localhost:4000
pnpm --filter frontend dev     # http://localhost:3000
```

## 👤 Akun demo

| Peran | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `password123` |
| Bagian Akademik | `akademik` | `password123` |
| Dosen | `andi` | `password123` |
| Mahasiswa | `2101001` | `password123` |

## 📚 API Endpoints

Semua endpoint berawalan `/api`. Dokumentasi interaktif tersedia di
`/api/docs` (Swagger UI).

| Modul | Endpoint (ringkasan) |
| --- | --- |
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Users | `GET/POST/PATCH/DELETE /users`, `GET /users/me` |
| Students | `GET/POST/PATCH/DELETE /students`, `GET /students/stats`, `POST /students/import` |
| Lecturers | `GET/POST/PATCH/DELETE /lecturers` |
| Courses | `GET/POST/PATCH/DELETE /courses` |
| Master | `/concentrations`, `/classrooms` |
| Academic Years | `GET/POST/PATCH /academic-years`, `GET /academic-years/active` |
| Schedules | `GET/POST/PATCH/DELETE /schedules` |
| KRS | `GET /krs`, `POST /krs`, `POST /krs/bulk`, `PATCH /krs/verify`, `GET /krs/student/:id` |
| Grades | `GET /grades`, `POST /grades`, `POST /grades/bulk`, `PATCH /grades/publish`, `GET /grades/entry` |
| KHS | `GET /khs/student/:id?academicYearId=`, `GET /khs/transcript/:id` |
| Dashboard | `GET /dashboard`, `GET /dashboard/lecturer`, `GET /dashboard/student` |
| Settings | `GET/PATCH /settings` |

## 🧮 Sistem penilaian

Mempertahankan rubrik asli STIE Pertiba (library `Penilaian`):

```
Nilai Akhir = 15% Absen + 30% UTS + 10% Tugas + 45% UAS
```

Konversi nilai akhir → grade → bobot (untuk IPS/IPK):

| Nilai Akhir | Grade | Bobot |
| --- | --- | --- |
| ≥ 80 | A | 4 |
| ≥ 70 | B | 3 |
| ≥ 60 | C | 2 |
| ≥ 40 | D | 1 |
| < 40 | E | 0 |

- **IPS** = Σ(bobot × sks) / Σ sks per semester.
- **IPK** = Σ(bobot × sks) / Σ sks seluruh semester (kumulatif).

Logika ini berada di `packages/shared` sehingga konsisten antara backend dan
frontend (mis. preview grade realtime di halaman entry nilai dosen).

## 📝 Catatan migrasi domain

Tabel & istilah dari versi asli dipetakan sebagai berikut:

| Asli (CI3/MySQL) | v2 (Prisma/PostgreSQL) |
| --- | --- |
| `students` | `Student` (+ `StudentParent`, `StudentOriginSchool`) |
| `lecturer` | `Lecturer` |
| `course` | `Course` (+ prasyarat `requirementCourse`) |
| `lecturer_schedule` | `Schedule` (+ `AcademicYear`, `Classroom`) |
| `plain_studies` (KRS) | `PlainStudy` (+ verifikasi) |
| `study_point` (nilai/KHS) | `StudyPoint` (+ status `published`) |
| `tb_options` | `Option` |
| `users` + `users_role` | `User` (enum `UserRole`) |

## 📄 Lisensi

Mengikuti proyek asli. Lihat repositori sumber untuk detail.
