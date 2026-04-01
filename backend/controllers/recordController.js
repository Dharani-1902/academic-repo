const AcademicRecord = require('../models/AcademicRecord');

const getRecords = async (req, res) => {
  try {
    const records = await AcademicRecord.findAll({ 
      where: { student_id: req.params.student_id } 
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addRecord = async (req, res) => {
  const { student_id, semester, subject_name, grade, credits } = req.body;
  try {
    const record = await AcademicRecord.create({
      student_id,
      semester,
      subject_name,
      grade,
      credits
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await AcademicRecord.findByPk(req.params.id);
    if (record) {
      record.semester = req.body.semester || record.semester;
      record.subject_name = req.body.subject_name || record.subject_name;
      record.grade = req.body.grade || record.grade;
      record.credits = req.body.credits || record.credits;

      await record.save();
      res.json(record);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const record = await AcademicRecord.findByPk(req.params.id);
    if (record) {
      await record.destroy();
      res.json({ message: 'Academic record removed' });
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllArrears = async (req, res) => {
  try {
    const arrears = await AcademicRecord.findAll({
      where: { grade: 'U' }
    });
    res.json(arrears);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecords, addRecord, updateRecord, deleteRecord, getAllArrears };
