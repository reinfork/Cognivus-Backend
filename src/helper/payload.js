
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
    'photo'
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
    'teacherid'
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
    'harga'
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
    'file',
    'video_link',
    'classid',
    'course_code'
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
    'class_code',
    'description',
    'lecturerid'
  ];

  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field] === '' ? null : body[field];
    }
    return payload;
  }, {});
};