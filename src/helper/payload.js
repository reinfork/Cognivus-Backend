
exports.student = (body = {}) => {
  const allowedFields = [
    'fullname',
    'gender',
    'address',
    'phone',
    'parentname',
    'parentphone',
    'birthdate',
    'birthplace',
    'classid',
    'photo',
    'relationship',
    'occupation',
    'program_interest',
    'english_level',
    'referral_source',
    'learning_mode',
    'preferred_time',
    'studied_before',
    'learning_reason'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.lecturer = (body = {}) => {
  const allowedFields = [
    'fullname',
    'gender',
    'address',
    'phone',
    'birthdate',
    'birthplace',
    'classid',
    'lasteducation',
    'photo'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.user = (body = {}) => {
  const allowedFields = [
    'username',
    'email',
    'roleid',
    'password',
    'is_active',
    'raw_meta_data',
    'google_id',
    'deactivate_at'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.level = (body = {}) => {
  const allowedFields = [
    'name',
    'description'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.teacher_level = (body = {}) => {
  const allowedFields = [
    'levelid',
    'lecturerid'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.program = (body = {}) => {
  const allowedFields = [
    'name',
    'description'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.price = (body = {}) => {
  const allowedFields = [
    'levelid',
    'programid',
    'harga',
    'monthlyprice',
    'name',
    'description'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.course = (body = {}) => {
  const allowedFields = [
    'title',
    'upload_date',
    'video_link',
    'classid',
    'course_code',
    'description'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.class = (body = {}) => {
  const allowedFields = [
    'levelid',
    'programid',
    'class_code',
    'description',
    'lecturerid',
    'schedule_time',
    'schedule_day',
    'schedule_time_2',
    'schedule_day_2',
    'branch',
    'is_default'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.grade = (body = {}) => {
  const allowedFields = [
    'studentid',
    'test_type',
    'listening_score',
    'speaking_score',
    'reading_score',
    'writing_score',
    'grammar_score',
    'vocabulary_score',
    'final_score',
    'description',
    'date_taken',
    'level',
    'referencenumber',
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.report = (body = {}) => {
  const allowedFields = [
    'studentid',
    'test_type',
    'grade_id',
    'upload_date',
    'report_code',
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.course_files = (body = {}) => {
  const allowedFields = [
    'courseid',
    'path',
    'url'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};

exports.ancillary = (body = {}) => {
  const allowedFields = [
    'name',
    'description',
    'price'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};