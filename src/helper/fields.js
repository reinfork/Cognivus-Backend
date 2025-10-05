exports.course = `
	courseid,
	course_code,
	title,
	upload_date,
	file,
	video_link,
	classid
`;

exports.class = `
	classid,
	class_code,
	description,
	levelid,
	lecturerid
`;

exports.student = `
	fullname,
	gender,
	address,
	phone,
	parentname,
	parentphone,
	created_at,
	updated_at, 
	studentid,
	classid,
	birthdate,
	birthplace,
	photo,
	tbuser!inner(
	  userid,
	  username,
	  email
	  )
`;

exports.lecturer = `
	lecturerid,
	fullname,
	birthplace,
	address,
	phone,
	birthdate,
	lasteducation,
	gender,
	photo,
	tbuser!inner(
	  userid,
	  username,
	  email
	  )
`;

exports.user = `
	userid,
	username,
	email,
	roleid,
	password,
	is_active,
	created_at,
	updated_at,
	deactivate_at
`;

exports.level = `
	levelid,
	name,
	description
`;

exports.teacher_level = `
	tlid,
	levelid,
	lecturerid
`;

exports.program = `
	programid,
	name,
	description
`;

exports.price = `
	priceid,
	levelid,
	programid,
	harga
`;