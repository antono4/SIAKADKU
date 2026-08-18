-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AKADEMIK', 'DOSEN', 'MAHASISWA');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('ganjil', 'genap', 'pendek');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('active', 'nonactive', 'graduated', 'drop_out');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MAHASISWA',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" INTEGER,
    "lecturerId" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concentration" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concentration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "building" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturer" (
    "id" SERIAL NOT NULL,
    "lecturerCode" TEXT NOT NULL,
    "nidn" TEXT,
    "name" TEXT NOT NULL,
    "gender" "Gender",
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "concentrationId" INTEGER,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "npm" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender",
    "placeOfBirth" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "photo" TEXT,
    "concentrationId" INTEGER,
    "className" TEXT,
    "registerYear" TEXT,
    "entryStatus" TEXT NOT NULL DEFAULT 'reguler',
    "status" "StudentStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students_parent" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "parentPhone" TEXT,
    "parentAddress" TEXT,
    "parentJob" TEXT,

    CONSTRAINT "students_parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students_origin_school" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "schoolName" TEXT,
    "schoolYear" TEXT,
    "major" TEXT,
    "graduationGrade" TEXT,

    CONSTRAINT "students_origin_school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" SERIAL NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseNameEnglish" TEXT,
    "sks" INTEGER NOT NULL DEFAULT 3,
    "semester" INTEGER NOT NULL,
    "concentrationId" INTEGER,
    "requirementCourseId" INTEGER,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_year" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturer_schedule" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "lecturerId" INTEGER,
    "classroomId" INTEGER,
    "day" "Day" NOT NULL,
    "sessionStart" TEXT NOT NULL,
    "sessionEnd" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturer_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plain_studies" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "scheduleId" INTEGER,
    "academicYearId" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plain_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_point" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "lecturerId" INTEGER,
    "academicYearId" INTEGER NOT NULL,
    "absent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "task" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "midterms" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "final" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION,
    "grade" TEXT,
    "weight" DOUBLE PRECISION,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "plainStudyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_options" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "tb_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_studentId_key" ON "users"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "users_lecturerId_key" ON "users"("lecturerId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "concentration_code_key" ON "concentration"("code");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_code_key" ON "classroom"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_lecturerCode_key" ON "lecturer"("lecturerCode");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_nidn_key" ON "lecturer"("nidn");

-- CreateIndex
CREATE INDEX "lecturer_concentrationId_idx" ON "lecturer"("concentrationId");

-- CreateIndex
CREATE UNIQUE INDEX "students_npm_key" ON "students"("npm");

-- CreateIndex
CREATE INDEX "students_concentrationId_idx" ON "students"("concentrationId");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_registerYear_idx" ON "students"("registerYear");

-- CreateIndex
CREATE UNIQUE INDEX "students_origin_school_studentId_key" ON "students_origin_school"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "course_courseCode_key" ON "course"("courseCode");

-- CreateIndex
CREATE INDEX "course_concentrationId_idx" ON "course"("concentrationId");

-- CreateIndex
CREATE INDEX "course_semester_idx" ON "course"("semester");

-- CreateIndex
CREATE UNIQUE INDEX "academic_year_code_key" ON "academic_year"("code");

-- CreateIndex
CREATE INDEX "academic_year_active_idx" ON "academic_year"("active");

-- CreateIndex
CREATE INDEX "lecturer_schedule_academicYearId_idx" ON "lecturer_schedule"("academicYearId");

-- CreateIndex
CREATE INDEX "lecturer_schedule_lecturerId_idx" ON "lecturer_schedule"("lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_schedule_courseId_day_sessionStart_academicYearId_key" ON "lecturer_schedule"("courseId", "day", "sessionStart", "academicYearId");

-- CreateIndex
CREATE INDEX "plain_studies_studentId_idx" ON "plain_studies"("studentId");

-- CreateIndex
CREATE INDEX "plain_studies_academicYearId_idx" ON "plain_studies"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "plain_studies_studentId_courseId_academicYearId_key" ON "plain_studies"("studentId", "courseId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "study_point_plainStudyId_key" ON "study_point"("plainStudyId");

-- CreateIndex
CREATE INDEX "study_point_studentId_idx" ON "study_point"("studentId");

-- CreateIndex
CREATE INDEX "study_point_lecturerId_idx" ON "study_point"("lecturerId");

-- CreateIndex
CREATE INDEX "study_point_academicYearId_idx" ON "study_point"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "study_point_studentId_courseId_academicYearId_key" ON "study_point"("studentId", "courseId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "tb_options_name_key" ON "tb_options"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer" ADD CONSTRAINT "lecturer_concentrationId_fkey" FOREIGN KEY ("concentrationId") REFERENCES "concentration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_concentrationId_fkey" FOREIGN KEY ("concentrationId") REFERENCES "concentration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_parent" ADD CONSTRAINT "students_parent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_origin_school" ADD CONSTRAINT "students_origin_school_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_concentrationId_fkey" FOREIGN KEY ("concentrationId") REFERENCES "concentration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_requirementCourseId_fkey" FOREIGN KEY ("requirementCourseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_schedule" ADD CONSTRAINT "lecturer_schedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_schedule" ADD CONSTRAINT "lecturer_schedule_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_schedule" ADD CONSTRAINT "lecturer_schedule_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_schedule" ADD CONSTRAINT "lecturer_schedule_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plain_studies" ADD CONSTRAINT "plain_studies_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plain_studies" ADD CONSTRAINT "plain_studies_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plain_studies" ADD CONSTRAINT "plain_studies_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "lecturer_schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plain_studies" ADD CONSTRAINT "plain_studies_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plain_studies" ADD CONSTRAINT "plain_studies_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_point" ADD CONSTRAINT "study_point_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_point" ADD CONSTRAINT "study_point_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_point" ADD CONSTRAINT "study_point_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_point" ADD CONSTRAINT "study_point_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_point" ADD CONSTRAINT "study_point_plainStudyId_fkey" FOREIGN KEY ("plainStudyId") REFERENCES "plain_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
