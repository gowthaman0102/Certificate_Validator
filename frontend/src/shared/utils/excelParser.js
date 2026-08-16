import * as XLSX from 'xlsx';

const HEADER_ALIASES = {
  register_number:      ['registernumber', 'register number', 'regno', 'reg no', 'registration number', 'register_number', 'register_no'],
  student_name:         ['name', 'studentname', 'student name', 'student_name', 'full name', 'fullname'],
  course:               ['department / course', 'department/course', 'department', 'course', 'branch', 'dept', 'dept / course', 'dept/course', 'department_course', 'course_department'],
  cgpa:                 ['cgpa', 'gpa', 'marks', 'grade'],
  end_year:             ['yearofpassing', 'year of passing', 'endyear', 'end year', 'passingyear', 'end_year', 'passing_year'],
  start_year:           ['startyear', 'start year', 'yearofjoining', 'year of joining', 'start_year', 'joining_year'],
  student_email:        ['email', 'studentemail', 'student email', 'student_email', 'email_address'],
  certificate_category: ['certificate category', 'certificatecategory', 'category', 'cert category', 'certificate_category', 'type'],
  certificate_detail:   ['certificate detail', 'certificatedetail', 'detail', 'cert detail', 'course detail', 'certificate_detail'],
  issue_date:           ['issuedate', 'issue date', 'date', 'issue_date'],
};

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase();
}

function cleanAlphaNumeric(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildFieldMap(headers) {
  const map = {};
  headers.forEach((header, index) => {
    const rawLower = normalizeHeader(header);
    const cleaned  = cleanAlphaNumeric(header);

    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      // 1. Direct match on raw lower header
      if (aliases.includes(rawLower)) {
        map[field] = index;
        break;
      }
      // 2. Cleaned alphanumeric match (handles "Department / Course" -> "departmentcourse")
      const cleanedAliases = aliases.map(cleanAlphaNumeric);
      if (cleanedAliases.includes(cleaned)) {
        map[field] = index;
        break;
      }
      // 3. Fallback for course / department header substring
      if (field === 'course' && (rawLower.includes('department') || rawLower.includes('course') || rawLower.includes('branch') || rawLower.includes('dept'))) {
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

  const requiredFields = ['register_number', 'student_name', 'student_email', 'course', 'cgpa', 'start_year', 'end_year', 'certificate_category'];
  const missingRequiredColumns = requiredFields.filter((f) => !(f in fieldMap));

  if (missingRequiredColumns.length > 0) {
    const columnLabels = {
      register_number: 'Register Number',
      student_name: 'Name',
      student_email: 'Student Email',
      course: 'Department / Course',
      cgpa: 'CGPA',
      start_year: 'Start Year',
      end_year: 'Year of Passing',
      certificate_category: 'Certificate Category',
    };
    const readableMissing = missingRequiredColumns.map(f => columnLabels[f] || f).join(', ');
    throw new Error(
      `Excel sheet is missing mandatory column(s): ${readableMissing}. ` +
      `All fields mandatory in single issuance must also be present in bulk issuance Excel sheet.`
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
