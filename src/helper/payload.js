const Joi = require("joi")

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
    'learning_reason',
    'paymentplan'
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

exports.class = Joi.object({
  levelid: Joi.number().integer(),
  programid: Joi.number().integer(),
  class_code: Joi.string().max(200),
  description: Joi.string().max(2000),
  lecturerid: Joi.number().integer(),
  schedule_time: Joi.string(),
  schedule_day: Joi.string(),
  schedule_time_2: Joi.string(),
  schedule_day_2: Joi.string(),
  branch: Joi.string().max(100),
  is_default: Joi.boolean()
});

exports.grade = Joi.object({
  studentid: Joi.number().integer(),
  test_type: Joi.string().max(100),
  listening_score: Joi.number().integer().max(100),
  reading_score: Joi.number().integer().max(100),
  writing_score: Joi.number().integer().max(100),
  grammar_score: Joi.number().integer().max(100),
  vocabulary_score: Joi.number().integer().max(100),
  final_score: Joi.number().integer().max(100),
  description: Joi.string(),
  date_taken: Joi.date(),
  level: Joi.string(),
  referencenumber: Joi.string()
});

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

exports.ancillary = Joi.object({
  name: Joi.string(),
  description: Joi.string().max(1000),
  price: Joi.number()

})

exports.payment_request = Joi.object({
  studentid: Joi.number().integer(),
  current_plan: Joi.string().max(100).trim(),
  request_plan: Joi.string().max(100).trim(),
  reason: Joi.string().max(2000).allow(''),
  note: Joi.string().max(1000).allow(''),
  reviewed_at: Joi.date(),
  status: Joi.string().max(50)
});