import * as XLSX from 'xlsx';

const HEADER_ALIASES = {
  register_number:      ['registernumber', 'register number', 'regno', 'reg no', 'registration number', 'register_number'],
  student_name:         ['name', 'studentname', 'student name', 'student_name'],
  course:               ['department', 'course', 'branch', 'dept'],
  cgpa:                 ['cgpa', 'gpa'],
  end_year:             ['yearofpassing', 'year of passing', 'endyear', 'end year', 'passingyear', 'end_year'],
  start_year:           ['startyear', 'start year', 'yearofjoining', 'year of joining', 'start_year'],
  student_email:        ['email', 'studentemail', 'student email', 'student_email'],
  certificate_category: ['certificate category', 'certificatecategory', 'category', 'cert category', 'certificate_category'],
  certificate_detail:   ['certificate detail', 'certificatedetail', 'detail', 'cert detail', 'course detail', 'certificate_detail'],
};

function normalizeHeader(header) {
  return String(header).trim().toLowerCase();
}

function buildFieldMap(headers) {
  const map = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized)) {
        map[field] = index;
        break;
      }
    }
  });
  return map;
}

export async function parseCertificateExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('The spreadsheet must have a header row and at least one data row.');
  }

  const headers = rawRows[0];
  const fieldMap = buildFieldMap(headers);

  const requiredFields = ['register_number', 'student_name', 'course', 'cgpa', 'end_year'];
  const missingRequiredColumns = requiredFields.filter((f) => !(f in fieldMap));

  if (missingRequiredColumns.length > 0) {
    throw new Error(
      `Could not find required column(s): ${missingRequiredColumns.join(', ')}. ` +
      `Expected headers like: Register Number, Name, Department, CGPA, Year of Passing.`
    );
  }

  const rows = [];
  for (let i = 1; i < rawRows.length; i++) {
    const raw = rawRows[i];
    if (raw.every((cell) => String(cell).trim() === '')) continue;

    const row = {};
    for (const [field, index] of Object.entries(fieldMap)) {
      row[field] = String(raw[index] ?? '').trim();
    }
    rows.push(row);
  }

  return rows;
}
