import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { KhsService } from '../khs/khs.service';
import { createPdfDoc, writeHeader, writeTable, finalizePdf } from './pdf.util';

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly khs: KhsService,
  ) {}

  private setPdfHeaders(res: Response, filename: string) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}.pdf"`,
    );
  }

  /** KRS PDF — list of courses the student plans to take in an academic year. */
  async krsPdf(studentId: number, academicYearId: number, res: Response) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { concentration: { select: { name: true } } },
    });
    if (!student) throw new NotFoundException('Mahasiswa tidak ditemukan.');
    const ay = await this.prisma.academicYear.findUnique({ where: { id: academicYearId } });
    if (!ay) throw new NotFoundException('Tahun ajaran tidak ditemukan.');

    const plains = await this.prisma.plainStudy.findMany({
      where: { studentId, academicYearId },
      include: {
        course: { select: { courseCode: true, courseName: true, sks: true, semester: true } },
        schedule: {
          include: {
            lecturer: { select: { name: true } },
            classroom: { select: { name: true } },
          },
        },
      },
      orderBy: { course: { semester: 'asc' } },
    });

    const totalSks = plains.reduce((s, p) => s + p.course.sks, 0);
    const doc = createPdfDoc();
    writeHeader(doc, {
      title: 'Kartu Rencana Studi (KRS)',
      subtitle: `Tahun Ajaran ${ay.code} — Semester ${ay.semester}`,
      institution: undefined,
      metaRows: [
        ['Nama', student.name],
        ['NPM', student.npm],
        ['Kelas', student.className ?? '-'],
        ['Konsentrasi', student.concentration?.name ?? '-'],
        ['Total SKS', String(totalSks)],
      ],
    });

    writeTable(doc, {
      columns: [
        { header: 'No', width: 30, align: 'center' },
        { header: 'Kode', width: 70 },
        { header: 'Mata Kuliah', width: 220 },
        { header: 'SKS', width: 40, align: 'center' },
        { header: 'Smt', width: 40, align: 'center' },
        { header: 'Jadwal', width: 120 },
      ],
      rows: plains.map((p, i) => {
        const s = p.schedule;
        const jadwal = s
          ? `${s.day} ${s.sessionStart}-${s.sessionEnd}${s.classroom ? ` (${s.classroom.name})` : ''}`
          : '-';
        return [
          i + 1,
          p.course.courseCode,
          p.course.courseName,
          p.course.sks,
          p.course.semester,
          jadwal,
        ];
      }),
    });

    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica').text(`Total SKS: ${totalSks}`, { align: 'right' });

    this.setPdfHeaders(res, `KRS-${student.npm}-${ay.code}`);
    finalizePdf(doc).pipe(res);
  }

  /** KHS PDF — study result card for a semester with IPS. */
  async khsPdf(studentId: number, academicYearId: number, res: Response) {
    const result = await this.khs.generate(studentId, academicYearId);

    const doc = createPdfDoc();
    writeHeader(doc, {
      title: 'Kartu Hasil Studi (KHS)',
      subtitle: `Tahun Ajaran ${result.academicYear.code} — Semester ${result.academicYear.semester}`,
      metaRows: [
        ['Nama', result.student.name],
        ['NPM', result.student.npm],
        ['Kelas', result.student.className ?? '-'],
        ['Konsentrasi', result.student.concentration?.name ?? '-'],
        ['IPS', String(result.ips)],
        ['IPK', String(result.ipk)],
      ],
    });

    writeTable(doc, {
      columns: [
        { header: 'No', width: 30, align: 'center' },
        { header: 'Kode', width: 70 },
        { header: 'Mata Kuliah', width: 220 },
        { header: 'SKS', width: 40, align: 'center' },
        { header: 'Nilai', width: 50, align: 'center' },
        { header: 'Bobot', width: 50, align: 'center' },
        { header: 'N×SKS', width: 60, align: 'center' },
      ],
      rows: result.rows.map((r, i) => [
        i + 1,
        r.courseCode,
        r.courseName,
        r.sks,
        r.grade ?? '-',
        r.weight ?? '-',
        r.qualityPoints ?? '-',
      ]) as (string | number)[][],
    });

    doc.moveDown(1);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(
        `Total SKS: ${result.totalSks}    |    IPS: ${result.ips}    |    IPK: ${result.ipk}`,
        { align: 'right' },
      );

    this.setPdfHeaders(res, `KHS-${result.student.npm}-${result.academicYear.code}`);
    finalizePdf(doc).pipe(res);
  }

  /** Transcript PDF — full academic transcript across all semesters. */
  async transcriptPdf(studentId: number, res: Response) {
    const transcript = await this.khs.transcript(studentId);

    const doc = createPdfDoc();
    writeHeader(doc, {
      title: 'Transkrip Nilai Akademik',
      metaRows: [
        ['Nama', transcript.student.name],
        ['NPM', transcript.student.npm],
        ['Konsentrasi', transcript.student.concentration?.name ?? '-'],
        ['Total SKS', String(transcript.totalSks)],
        ['IPK', String(transcript.ipk)],
      ],
    });

    for (const sem of transcript.semesters) {
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(`${sem.academicYear.code} — Semester ${sem.academicYear.semester}  (IPS: ${sem.ips}, ${sem.totalSks} SKS)`);
      doc.moveDown(0.3);
      writeTable(doc, {
        columns: [
          { header: 'Kode', width: 80 },
          { header: 'Mata Kuliah', width: 250 },
          { header: 'SKS', width: 40, align: 'center' },
          { header: 'Nilai', width: 50, align: 'center' },
          { header: 'N×SKS', width: 60, align: 'center' },
        ],
        rows: sem.rows.map((r) => [
          r.courseCode,
          r.courseName,
          r.sks,
          r.grade,
          r.qualityPoints ?? '-',
        ]) as (string | number)[][],
      });
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`SKS: ${sem.totalSks}    IPS: ${sem.ips}`, { align: 'right' });
    }

    doc.moveDown(1);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(`Total SKS: ${transcript.totalSks}    |    IPK: ${transcript.ipk}`, { align: 'center' });

    this.setPdfHeaders(res, `Transkrip-${transcript.student.npm}`);
    finalizePdf(doc).pipe(res);
  }

  /** CSV export of students. */
  studentsCsv(res: Response) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="data-mahasiswa.csv"',
    );
    res.write('NPM;Nama;Gender;Kelas;Konsentrasi;Angkatan;Status\n');
    // stream rows
    return this.prisma.student
      .findMany({
        include: { concentration: { select: { name: true } } },
        orderBy: { npm: 'asc' },
      })
      .then((rows) => {
        for (const s of rows) {
          res.write(
            [
              s.npm,
              s.name,
              s.gender ?? '',
              s.className ?? '',
              s.concentration?.name ?? '',
              s.registerYear ?? '',
              s.status,
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(';') + '\n',
          );
        }
        res.end();
      });
  }

  /** CSV export of grades. */
  async gradesCsv(academicYearId: number, res: Response) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="data-nilai.csv"');
    res.write('NPM;Nama;Kode MK;Mata Kuliah;SKS;Absen;Tugas;UTS;UAS;Nilai Akhir;Grade\n');
    const rows = await this.prisma.studyPoint.findMany({
      where: { academicYearId },
      include: {
        student: { select: { npm: true, name: true } },
        course: { select: { courseCode: true, courseName: true, sks: true } },
      },
      orderBy: { student: { npm: 'asc' } },
    });
    for (const p of rows) {
      res.write(
        [
          p.student.npm,
          p.student.name,
          p.course.courseCode,
          p.course.courseName,
          p.course.sks,
          p.absent,
          p.task,
          p.midterms,
          p.final,
          p.finalScore ?? '',
          p.grade ?? '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(';') + '\n',
      );
    }
    res.end();
  }
}
