import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SIAKAD Terpadu v2...');

  // ── Options ──────────────────────────────────
  await prisma.option.upsert({ where: { name: 'app_name' }, update: {}, create: { name: 'app_name', value: 'SIAKAD Terpadu' } });
  await prisma.option.upsert({ where: { name: 'institution_name' }, update: {}, create: { name: 'institution_name', value: 'STIE Pertiba Pangkalpinang' } });
  await prisma.option.upsert({ where: { name: 'max_sks' }, update: {}, create: { name: 'max_sks', value: '24' } });

  // ── Concentrations ───────────────────────────
  const akuntansi = await prisma.concentration.upsert({
    where: { code: 'AKT' },
    update: {},
    create: { code: 'AKT', name: 'Akuntansi', description: 'Konsentrasi Akuntansi' },
  });
  const manajemen = await prisma.concentration.upsert({
    where: { code: 'MNG' },
    update: {},
    create: { code: 'MNG', name: 'Manajemen', description: 'Konsentrasi Manajemen' },
  });

  // ── Classrooms ───────────────────────────────
  const r1 = await prisma.classroom.upsert({ where: { code: 'R201' }, update: {}, create: { code: 'R201', name: 'Ruang 201', capacity: 40, building: 'Gedung A' } });
  const r2 = await prisma.classroom.upsert({ where: { code: 'R202' }, update: {}, create: { code: 'R202', name: 'Ruang 202', capacity: 35, building: 'Gedung A' } });

  // ── Lecturers ────────────────────────────────
  const lecturers = [
    { lecturerCode: 'D001', nidn: '0001', name: 'Dr. Andi Wijaya, M.M.', gender: 'L', email: 'andi@pertiba.ac.id', concentrationId: manajemen.id },
    { lecturerCode: 'D002', nidn: '0002', name: 'Dr. Siti Rahayu, M.Akt.', gender: 'P', email: 'siti@pertiba.ac.id', concentrationId: akuntansi.id },
    { lecturerCode: 'D003', nidn: '0003', name: 'Budi Santoso, S.E., M.Si.', gender: 'L', email: 'budi@pertiba.ac.id', concentrationId: manajemen.id },
  ];
  const lecturerRows = [];
  for (const l of lecturers) {
    const row = await prisma.lecturer.upsert({
      where: { lecturerCode: l.lecturerCode },
      update: {},
      create: l as never,
    });
    lecturerRows.push(row);
  }

  // ── Courses ─────────────────────────────────
  const courses = [
    { courseCode: 'MK101', courseName: 'Pengantar Akuntansi', courseNameEnglish: 'Introduction to Accounting', sks: 3, semester: 1, concentrationId: akuntansi.id },
    { courseCode: 'MK102', courseName: 'Matematika Ekonomi', courseNameEnglish: 'Economic Mathematics', sks: 3, semester: 1, concentrationId: manajemen.id },
    { courseCode: 'MK201', courseName: 'Manajemen Keuangan', courseNameEnglish: 'Financial Management', sks: 4, semester: 3, concentrationId: manajemen.id },
    { courseCode: 'MK202', courseName: 'Akuntansi Keuangan', courseNameEnglish: 'Financial Accounting', sks: 4, semester: 3, concentrationId: akuntansi.id },
    { courseCode: 'MK301', courseName: 'Perpajakan', courseNameEnglish: 'Taxation', sks: 3, semester: 5, concentrationId: akuntansi.id },
  ];
  const courseRows = [];
  for (const c of courses) {
    const row = await prisma.course.upsert({
      where: { courseCode: c.courseCode },
      update: {},
      create: c as never,
    });
    courseRows.push(row);
  }

  // ── Academic Year ────────────────────────────
  const activeYear = await prisma.academicYear.upsert({
    where: { code: '2025/2026' },
    update: { active: true },
    create: {
      code: '2025/2026',
      semester: 'ganjil',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-02-28'),
      active: true,
    },
  });
  const prevYear = await prisma.academicYear.upsert({
    where: { code: '2024/2025' },
    update: {},
    create: {
      code: '2024/2025',
      semester: 'genap',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-06-30'),
      active: false,
    },
  });

  // ── Schedules ───────────────────────────────
  const schedules = [
    { courseId: courseRows[0].id, lecturerId: lecturerRows[1].id, classroomId: r1.id, day: 'senin', sessionStart: '07:30', sessionEnd: '09:30', academicYearId: activeYear.id },
    { courseId: courseRows[1].id, lecturerId: lecturerRows[0].id, classroomId: r2.id, day: 'selasa', sessionStart: '10:00', sessionEnd: '12:00', academicYearId: activeYear.id },
    { courseId: courseRows[2].id, lecturerId: lecturerRows[2].id, classroomId: r1.id, day: 'rabu', sessionStart: '13:00', sessionEnd: '15:30', academicYearId: activeYear.id },
  ];
  for (const s of schedules) {
    await prisma.schedule.upsert({
      where: {
        courseId_day_sessionStart_academicYearId: {
          courseId: s.courseId, day: s.day as never, sessionStart: s.sessionStart, academicYearId: s.academicYearId,
        },
      },
      update: {},
      create: s as never,
    });
  }

  // ── Students ────────────────────────────────
  const students = [
    { npm: '2101001', name: 'Ahmad Fauzi', gender: 'L', concentrationId: manajemen.id, className: 'MNG-2021A', registerYear: '2021', birthDate: new Date('2002-05-12'), entryStatus: 'reguler', status: 'active' },
    { npm: '2101002', name: 'Dewi Lestari', gender: 'P', concentrationId: akuntansi.id, className: 'AKT-2021A', registerYear: '2021', birthDate: new Date('2002-08-20'), entryStatus: 'reguler', status: 'active' },
    { npm: '2201P01', name: 'Rina Marlina', gender: 'P', concentrationId: manajemen.id, className: 'MNG-2022', registerYear: '2022', entryStatus: 'pindahan', status: 'active' },
  ];
  const studentRows = [];
  for (const s of students) {
    const row = await prisma.student.upsert({
      where: { npm: s.npm },
      update: {},
      create: s as never,
    });
    studentRows.push(row);
  }

  // ── KRS for student 1 ────────────────────────
  const plain1 = await prisma.plainStudy.create({
    data: { studentId: studentRows[0].id, courseId: courseRows[1].id, scheduleId: 1, academicYearId: activeYear.id, verified: true, verifiedById: 'seed' },
    skipDuplicates: true,
  }).catch(() => null);
  await prisma.plainStudy.create({
    data: { studentId: studentRows[0].id, courseId: courseRows[2].id, scheduleId: 3, academicYearId: activeYear.id, verified: true, verifiedById: 'seed' },
    skipDuplicates: true,
  }).catch(() => null);

  // ── Published grades for student 1 (prev year) ──
  await prisma.studyPoint.upsert({
    where: {
      studentId_courseId_academicYearId: {
        studentId: studentRows[0].id, courseId: courseRows[0].id, academicYearId: prevYear.id,
      },
    },
    create: {
      studentId: studentRows[0].id, courseId: courseRows[0].id, academicYearId: prevYear.id,
      absent: 90, task: 85, midterms: 75, final: 80, finalScore: 81.5, grade: 'A', weight: 4, published: true,
      plainStudyId: plain1?.id,
    },
    update: {},
  }).catch(() => null);

  // ── Users (admin + lecturer-linked + student-linked) ──
  const pw = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { name: 'Administrator', username: 'admin', email: 'admin@pertiba.ac.id', password: pw, role: UserRole.ADMIN, active: true },
  });
  await prisma.user.upsert({
    where: { username: 'akademik' },
    update: {},
    create: { name: 'Bagian Akademik', username: 'akademik', email: 'akademik@pertiba.ac.id', password: pw, role: UserRole.AKADEMIK, active: true },
  });
  await prisma.user.upsert({
    where: { username: 'andi' },
    update: {},
    create: { name: lecturerRows[0].name, username: 'andi', email: lecturerRows[0].email, password: pw, role: UserRole.DOSEN, lecturerId: lecturerRows[0].id, active: true },
  });
  await prisma.user.upsert({
    where: { username: '2101001' },
    update: {},
    create: { name: studentRows[0].name, username: '2101001', password: pw, role: UserRole.MAHASISWA, studentId: studentRows[0].id, active: true },
  });

  console.log('✅ Seed complete.');
  console.log('   Demo logins:');
  console.log('   admin / password123        (Administrator)');
  console.log('   akademik / password123     (Bagian Akademik)');
  console.log('   andi / password123         (Dosen)');
  console.log('   2101001 / password123      (Mahasiswa)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
