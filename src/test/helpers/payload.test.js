const payload = require('../../helper/payload.js');

describe('Payload Helper', () => {
  describe('Student Payload', () => {
    it('should create student payload with all valid fields', () => {
      const input = {
        fullname: 'John Doe',
        gender: 'Male',
        address: '123 Main St',
        phone: '1234567890',
        parentname: 'Jane Doe',
        parentphone: '0987654321',
        birthdate: '2000-01-01',
        birthplace: 'New York',
        classid: '1',
        photo: 'photo.jpg',
        invalidField: 'should-be-ignored'
      };
 
      const result = payload.student(input);

      expect(result).toEqual({
        fullname: 'John Doe',
        gender: 'Male',
        address: '123 Main St',
        phone: '1234567890',
        parentname: 'Jane Doe',
        parentphone: '0987654321',
        birthdate: '2000-01-01',
        birthplace: 'New York',
        classid: '1',
        photo: 'photo.jpg'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        fullname: 'John Doe',
        gender: '',
        address: '   ',
        phone: '1234567890'
      };

      const result = payload.student(input);

      expect(result.gender).toBeNull();
      expect(result.address).toBeNull();
      expect(result.phone).toBe('1234567890');
    });

    it('should handle undefined values gracefully', () => {
      const input = {
        fullname: 'John Doe',
        gender: undefined,
        phone: '1234567890'
      };

      const result = payload.student(input);

      expect(result).toEqual({
        fullname: 'John Doe',
        phone: '1234567890'
      });
      expect(result).not.toHaveProperty('gender');
    });

    it('should return empty object for empty input', () => {
      const result = payload.student({});
      expect(result).toEqual({});
    });

    it('should return empty object for null/undefined input', () => {
      expect(payload.student(null)).toEqual({});
      expect(payload.student(undefined)).toEqual({});
    });
  });

  describe('Lecturer Payload', () => {
    it('should create lecturer payload with all valid fields', () => {
      const input = {
        fullname: 'Dr. Smith',
        gender: 'Male',
        address: '456 University Ave',
        phone: '2345678901',
        birthdate: '1980-05-15',
        birthplace: 'Boston',
        classid: '2',
        lasteducation: 'PhD Computer Science',
        photo: 'lecturer.jpg',
        invalidField: 'should-be-ignored'
      };

      const result = payload.lecturer(input);

      expect(result).toEqual({
        fullname: 'Dr. Smith',
        gender: 'Male',
        address: '456 University Ave',
        phone: '2345678901',
        birthdate: '1980-05-15',
        birthplace: 'Boston',
        classid: '2',
        lasteducation: 'PhD Computer Science',
        photo: 'lecturer.jpg'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        fullname: 'Dr. Smith',
        gender: '',
        lasteducation: '   '
      };

      const result = payload.lecturer(input);

      expect(result.gender).toBeNull();
      expect(result.lasteducation).toBeNull();
    });
  });

  describe('User Payload', () => {
    it('should create user payload with all valid fields', () => {
      const input = {
        username: 'testuser',
        email: 'test@example.com',
        roleid: 1,
        password: 'password123',
        is_active: true,
        invalidField: 'should-be-ignored'
      };

      const result = payload.user(input);

      expect(result).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        roleid: 1,
        password: 'password123',
        is_active: true
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        username: 'testuser',
        email: '',
        password: '   '
      };

      const result = payload.user(input);

      expect(result.email).toBeNull();
      expect(result.password).toBeNull();
    });
  });

  describe('Level Payload', () => {
    it('should create level payload with all valid fields', () => {
      const input = {
        name: 'Beginner',
        description: 'Basic level for new students',
        invalidField: 'should-be-ignored'
      };

      const result = payload.level(input);

      expect(result).toEqual({
        name: 'Beginner',
        description: 'Basic level for new students'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        name: 'Beginner',
        description: ''
      };

      const result = payload.level(input);

      expect(result.description).toBeNull();
    });
  });

  describe('Teacher Level Payload', () => {
    it('should create teacher_level payload with all valid fields', () => {
      const input = {
        levelid: '1',
        lecturerid: '2',
        invalidField: 'should-be-ignored'
      };

      const result = payload.teacher_level(input);

      expect(result).toEqual({
        levelid: '1',
        lecturerid: '2'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        levelid: '1',
        lecturerid: ''
      };

      const result = payload.teacher_level(input);

      expect(result.lecturerid).toBeNull();
    });
  });

  describe('Program Payload', () => {
    it('should create program payload with all valid fields', () => {
      const input = {
        name: 'English Basics',
        description: 'Basic English program',
        invalidField: 'should-be-ignored'
      };

      const result = payload.program(input);

      expect(result).toEqual({
        name: 'English Basics',
        description: 'Basic English program'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        name: 'English Basics',
        description: ''
      };

      const result = payload.program(input);

      expect(result.description).toBeNull();
    });
  });

  describe('Price Payload', () => {
    it('should create price payload with all valid fields', () => {
      const input = {
        levelid: '1',
        programid: '2',
        harga: 1500000,
        invalidField: 'should-be-ignored'
      };

      const result = payload.price(input);

      expect(result).toEqual({
        levelid: '1',
        programid: '2',
        harga: 1500000
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        levelid: '1',
        programid: '',
        harga: 1500000
      };

      const result = payload.price(input);

      expect(result.programid).toBeNull();
    });
  });

  describe('Course Payload', () => {
    it('should create course payload with all valid fields', () => {
      const input = {
        title: 'Introduction to Programming',
        upload_date: '2023-01-01',
        video_link: 'https://example.com/video',
        classid: '1',
        course_code: 'CS101',
        description: 'Basic programming course',
        invalidField: 'should-be-ignored'
      };

      const result = payload.course(input);

      expect(result).toEqual({
        title: 'Introduction to Programming',
        upload_date: '2023-01-01',
        video_link: 'https://example.com/video',
        classid: '1',
        course_code: 'CS101',
        description: 'Basic programming course'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        title: 'Programming Course',
        video_link: '',
        description: '   '
      };

      const result = payload.course(input);

      expect(result.video_link).toBeNull();
      expect(result.description).toBeNull();
    });
  });

  describe('Class Payload', () => {
    it('should create class payload with all valid fields', () => {
      const input = {
        levelid: '1',
        class_code: 'CS101',
        description: 'Introduction to CS',
        lecturerid: '2',
        invalidField: 'should-be-ignored'
      };

      const result = payload.class(input);

      expect(result).toEqual({
        levelid: '1',
        class_code: 'CS101',
        description: 'Introduction to CS',
        lecturerid: '2'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        levelid: '1',
        class_code: 'CS101',
        description: ''
      };

      const result = payload.class(input);

      expect(result.description).toBeNull();
    });
  });

  describe('Grade Payload', () => {
    it('should create grade payload with all valid fields', () => {
      const input = {
        studentid: '1',
        test_type: 'Midterm',
        listening_score: 85,
        speaking_score: 90,
        reading_score: 88,
        writing_score: 92,
        final_score: 88.75,
        description: 'Midterm results',
        date_taken: '2023-01-15',
        invalidField: 'should-be-ignored'
      };

      const result = payload.grade(input);

      expect(result).toEqual({
        studentid: '1',
        test_type: 'Midterm',
        listening_score: 85,
        speaking_score: 90,
        reading_score: 88,
        writing_score: 92,
        final_score: 88.75,
        description: 'Midterm results',
        date_taken: '2023-01-15'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        studentid: '1',
        test_type: 'Midterm',
        description: ''
      };

      const result = payload.grade(input);

      expect(result.description).toBeNull();
    });
  });

  describe('Report Payload', () => {
    it('should create report payload with all valid fields', () => {
      const input = {
        studentid: '1',
        test_type: 'Midterm',
        grade_id: '1',
        upload_date: '2023-01-15',
        report_code: 'RPT001',
        invalidField: 'should-be-ignored'
      };

      const result = payload.report(input);

      expect(result).toEqual({
        studentid: '1',
        test_type: 'Midterm',
        grade_id: '1',
        upload_date: '2023-01-15',
        report_code: 'RPT001'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        studentid: '1',
        test_type: 'Midterm',
        report_code: ''
      };

      const result = payload.report(input);

      expect(result.report_code).toBeNull();
    });
  });

  describe('Course Files Payload', () => {
    it('should create course_files payload with all valid fields', () => {
      const input = {
        courseid: '1',
        path: 'courses/file.pdf',
        url: 'https://example.com/file.pdf',
        invalidField: 'should-be-ignored'
      };

      const result = payload.course_files(input);

      expect(result).toEqual({
        courseid: '1',
        path: 'courses/file.pdf',
        url: 'https://example.com/file.pdf'
      });
      expect(result).not.toHaveProperty('invalidField');
    });

    it('should handle empty string values by converting to null', () => {
      const input = {
        courseid: '1',
        path: 'courses/file.pdf',
        url: ''
      };

      const result = payload.course_files(input);

      expect(result.url).toBeNull();
    });
  });

  describe('Security and Validation', () => {
    it('should only include allowed fields for each entity', () => {
      const maliciousInput = {
        id: '1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        deleted_at: '2023-01-01',
        admin: true,
        password_hash: 'secret',
        fullname: 'John Doe'
      };

      const result = payload.student(maliciousInput);

      // Should only include allowed fields
      expect(Object.keys(result)).toEqual(['fullname']);
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('created_at');
      expect(result).not.toHaveProperty('admin');
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should handle non-string values correctly', () => {
      const input = {
        fullname: 'John Doe',
        classid: 1, // number instead of string
        is_active: true, // boolean
        scores: [85, 90, 88] // array
      };

      const result = payload.student(input);

      expect(result.classid).toBe(1);
      expect(result.is_active).toBe(true);
      expect(result).not.toHaveProperty('scores'); // arrays not in allowed fields
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(payload.student(null)).toEqual({});
      expect(payload.student(undefined)).toEqual({});
      expect(payload.lecturer(null)).toEqual({});
      expect(payload.user(undefined)).toEqual({});
    });

    it('should handle empty objects', () => {
      expect(payload.student({})).toEqual({});
      expect(payload.lecturer({})).toEqual({});
      expect(payload.user({})).toEqual({});
    });

    it('should handle objects with only invalid fields', () => {
      const input = {
        invalid1: 'value1',
        invalid2: 'value2',
        invalid3: 'value3'
      };

      const result = payload.student(input);
      expect(result).toEqual({});
    });
  });

  describe('Data Type Consistency', () => {
    it('should preserve data types for allowed fields', () => {
      const input = {
        fullname: 'John Doe',
        classid: 1,
        is_active: true,
        price: 1500000,
        birthdate: '2000-01-01'
      };

      const result = payload.student(input);

      expect(typeof result.fullname).toBe('string');
      expect(typeof result.classid).toBe('number');
      expect(typeof result.is_active).toBe('boolean');
      expect(typeof result.birthdate).toBe('string');
    });

    it('should handle mixed data types in input', () => {
      const input = {
        fullname: 'John Doe',
        classid: '1', // string
        phone: 1234567890, // number
        is_active: 'true' // string boolean
      };

      const result = payload.student(input);

      expect(result.classid).toBe('1');
      expect(result.phone).toBe(1234567890);
      expect(result.is_active).toBe('true');
    });
  });
});
