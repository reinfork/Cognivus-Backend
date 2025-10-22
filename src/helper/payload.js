function sanitize(input, allowedFields = []) {
  // Handle null/undefined/non-object input
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }
  const result = {};

  for (const field of allowedFields) {
    // Skip if field doesn't exist in input or is explicitly undefined
    if (!(field in input) || input[field] === undefined) continue;

    const value = input[field];

    // Handle all possible value types
    if (value === null) {
      result[field] = null;
    } else if (typeof value === 'string') {
      result[field] = value.trim() === '' ? null : value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result[field] = value;
    }
  }

  return result;
}

const allowed = {
  student: [
    'fullname', 'gender', 'birthdate', 'birthplace', 'address', 'phone',
    'parentname', 'parentphone', 'photo', 'classid', 'programid', 'levelid', 'is_active'
  ],
  lecturer: [
    'fullname', 'gender', 'birthdate', 'birthplace', 'address', 'phone',
    'photo', 'classid', 'lasteducation'
  ],
  user: [
    'username', 'email', 'password', 'roleid', 'is_active'
  ],
  level: [
    'name', 'description'
  ],
  teacher_level: [
    'levelid', 'lecturerid'
  ],
  program: [
    'name', 'description'
  ],
  price: [
    'levelid', 'programid', 'harga'
  ],
  course: [
    'title', 'upload_date', 'video_link', 'description', 'classid', 'course_code'
  ],
  class: [
    'levelid', 'class_code', 'description', 'lecturerid'
  ],
  grade: [
    'studentid', 'test_type', 'listening_score', 'reading_score',
    'speaking_score', 'writing_score', 'final_score', 'description', 'date_taken'
  ],
  report: [
    'studentid', 'test_type', 'grade_id', 'report_code', 'upload_date'
  ],
  course_files: [
    'courseid', 'path', 'url'
  ]
};

// Helper to ensure we handle null/undefined in the exported functions
function createSanitizer(allowedFields) {
  return (input) => {
    if (input === null || input === undefined) return {};
    return sanitize(input, allowedFields);
  };
}

module.exports = {
  student: createSanitizer(allowed.student),
  lecturer: createSanitizer(allowed.lecturer),
  user: createSanitizer(allowed.user),
  level: createSanitizer(allowed.level),
  teacher_level: createSanitizer(allowed.teacher_level),
  program: createSanitizer(allowed.program),
  price: createSanitizer(allowed.price),
  course: createSanitizer(allowed.course),
  class: createSanitizer(allowed.class),
  grade: createSanitizer(allowed.grade),
  report: createSanitizer(allowed.report),
  course_files: createSanitizer(allowed.course_files)
};
