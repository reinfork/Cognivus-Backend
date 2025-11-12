const supabase = require('../config/supabase');

/**
 * Get recent activity across the system
 * Aggregates recent records from students, lecturers, classes, and grades
 */
exports.getRecentActivity = async (req, res) => {
  try {
    // Fetch recent students (last 5)
    const { data: recentStudents, error: studentsError } = await supabase
      .from('tbstudent')
      .select('fullname, created_at, tbuser!inner(email)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (studentsError) throw studentsError;

    // Fetch recent lecturers (last 5)
    const { data: recentLecturers, error: lecturersError } = await supabase
      .from('tblecturer')
      .select('fullname, tbuser!inner(created_at, email)')
      .order('tbuser(created_at)', { ascending: false })
      .limit(5);

    if (lecturersError) throw lecturersError;

    // Fetch recent grades (last 5)
    const { data: recentGrades, error: gradesError } = await supabase
      .from('tbgrade')
      .select('final_score, date_taken, tbstudent!inner(fullname)')
      .order('date_taken', { ascending: false })
      .limit(5);

    if (gradesError) throw gradesError;

    // Transform to unified activity format
    const activities = [];

    // Add student registrations
    if (recentStudents && recentStudents.length > 0) {
      recentStudents.forEach(s => {
        activities.push({
          type: 'student_registration',
          title: 'New student registration',
          description: `${s.fullname} registered`,
          timestamp: s.created_at,
          icon: 'user',
          color: 'blue'
        });
      });
    }

    // Add lecturer registrations
    if (recentLecturers && recentLecturers.length > 0) {
      recentLecturers.forEach(l => {
        activities.push({
          type: 'lecturer_registration',
          title: 'New lecturer joined',
          description: `${l.fullname} registered`,
          timestamp: l.tbuser.created_at,
          icon: 'teacher',
          color: 'green'
        });
      });
    }

    // Add grade submissions
    if (recentGrades && recentGrades.length > 0) {
      recentGrades.forEach(g => {
        activities.push({
          type: 'grade_submitted',
          title: 'Grade submitted',
          description: `${g.tbstudent.fullname} scored ${g.final_score}`,
          timestamp: g.date_taken,
          icon: 'grade',
          color: 'yellow'
        });
      });
    }

    // Sort by timestamp descending and get top 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      success: true,
      data: sortedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};
