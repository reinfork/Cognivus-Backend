const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grades');
const {authenticateToken} = require('../middleware/auth');
const {validate} = require('../middleware/sanitizer');
const {grade: schema} = require('../helper/payload')


router.use(authenticateToken);

router.get('/', gradeController.getAll);
router.post('/', validate(schema), gradeController.create);
router.get('/:id/certificate', gradeController.downloadCertificate);
router.get('/:id', gradeController.getById);
router.put('/:id', validate(schema), gradeController.update);
router.delete('/:id', gradeController.delete);

module.exports = router;