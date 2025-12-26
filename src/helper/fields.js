exports.course = `
	courseid,
	course_code,
	title,
	upload_date,
	video_link,
	classid,
	description,
	tbcourse_files(
		cfid,
		path,
		url,
		upload_date
		)
`;

exports.class = `
	classid,
	class_code,
	description,
	levelid,
	lecturerid,
	schedule_day,
	schedule_time,
	schedule_day_2,
	schedule_time_2
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
	  ),
	tbclass(
	  classid,
	  class_code,
	  description,
	  levelid,
	  level:tblevel(
	    levelid,
	    name
	  )
	)
`;

exports.user = `
	userid,
	username,
	email,
	roleid,
	is_active,
	created_at,
	updated_at,
	deactivate_at,
	raw_meta_data,
	password,
	google_id
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
	harga,
	monthlyprice,
	name,
	description
`;

exports.grade = `
	gradeid,
	studentid,
	test_type,
	listening_score,
	speaking_score,
	reading_score,
	writing_score,
	final_score,
	vocabulary_score,
	grammar_score,
	date_taken,
	description,
	tbstudent(
		fullname,
		studentid
		)
`;

exports.ancillary = `
	apid,
	name,
	description,
	price
`;