const supabase = require('../config/supabase');
const { grade: select } = require('../helper/fields');
const { grade: payload } = require('../helper/payload');
const reports = require('../models/reports');
const {grade} = require('../helper/whatsapp');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const bucket = "reports";

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbgrade')
      .select(select);

    if (error) throw error;

    return res.json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbgrade')
      .select(select)
      .eq('studentid', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

//insert new student grade
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);
    const file = req.file;

    if (!insert.test_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test type are required for a new grade' 
      });
    }

    //insert new grade into table
    const { data, error } = await supabase
      .from('tbgrade')
      .insert(insert)
      .select();

    if(error) throw error;
    // let uploaded = []

    // //upload files
    // if(file) {
    //   results = await reports.create(data[0], file, bucket);
    //   uploaded.push(results);
    // };

    return res.status(201).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating new grade',
      error: error.message
    });
  }
};


// Update data lecturer
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    const file = req.file;

    // update grade
    const { data, error } = await supabase
      .from('tbgrade')
      .update(insert)
      .eq('gradeid', id)
      .select();

    if (error) throw error; 
    // let uploaded = [];

    // //find or upload
    // if (file) {
    //   const results = await reports.createOrReplace(data[0], file, bucket);
    //   uploaded.push(results);
    // };

    return res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
};

//remove student grade record
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tbgrade')
      .delete()
      .eq('gradeid', id)
      .select(select);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'student/grade not found.'
      });
    }

    // const file = data[0].tbreport_files;

    // //remove files from bucket
    // if(file) await reports.delete(file[0], bucket);

    return res.status(200).json({
      success: true,
      message: `students grade id: ${id} hard deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting students grade',
      error: error.message
    });
  }
};

// Download certificate for a specific grade
exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params; 

    // Fetch grade data with student information
    const { data, error } = await supabase
      .from('tbgrade')
      .select(select)
      .eq('gradeid', id)
      .single();

    if (error || !data) throw error;

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 72, right: 72 }
    });

    const fileName = `Certificate_${data.test_type || 'Test'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    const templatePath = path.join(__dirname, '../assets/advanced.jpg');
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, {
        width: 842,
        height: 595
      });
    } else {
      doc.rect(0, 0, 842, 595).fill('#f8f9fa');
      
      // Border
      doc.rect(30, 30, 782, 535)
         .lineWidth(3)
         .strokeColor('#2c3e50')
         .stroke();
      
      doc.rect(40, 40, 762, 515)
         .lineWidth(1)
         .strokeColor('#34495e')
         .stroke();
    }

    // Text overlay
    const referencenumber = data.referencenumber;
    const studentName = data.tbstudent.fullname;
    const birthdate = data.tbstudent.birthdate
      ? new Date(data.tbstudent.birthdate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'N/A';
    const testType = data.test_type || 'English Proficiency Test';
    const dateTaken = data.date_taken 
      ? new Date(data.date_taken).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'N/A';

    //reference number
    doc.fontSize(13)
       .font('Helvetica')
       .fillColor('#00000')
       .text(referencenumber, 90, 16, {
         align: 'left',
         width: 200
       });


    // Student name
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(studentName, 73, 270, {
         align: 'left',
         width: 842
       });

    // Birthdate
    doc.fontSize(13)
       .font('Helvetica')
       .fillColor('#00000')
       .text(birthdate, 130, 316, {
         align: 'left',
         width: 842
       });

    // Scores section
    const scoresY = 300;
    const scoreLabels = [
      { label: 'Listening', score: data.listening_score },
      { label: 'Speaking', score: data.speaking_score },
      { label: 'Reading', score: data.reading_score },
      { label: 'Writing', score: data.writing_score },
      { label: 'Grammar', score: data.grammar_score },
      { label: 'Vocabulary', score: data.vocabulary_score },
      { label: 'average', score: data.final_score}
    ].filter(item => item.score !== null && item.score !== undefined);

    if (scoreLabels.length > 0) {

      const scoreSpace = 20;
      const startY = 395;

      scoreLabels.forEach((item, index) => {
        const y = startY + (index * scoreSpace);
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text(item.score.toString(), 590, y, {
             width: 50,
             align: 'center'
           });
      });
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message
    });
  }
}; 