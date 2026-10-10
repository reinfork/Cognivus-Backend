const express = require('express');
const router = express.Router();
const classController = require('../controllers/classes');
const {authenticateToken} = require('../middleware/auth');
const {validate}= require('../middleware/sanitizer');
const {class: schema} = require('../helper/payload');


router.use(authenticateToken);


router.get('/', classController.getAll);
router.post('/', validate(schema), classController.create);
router.get('/:id', classController.getById);
router.put('/:id', validate(schema), classController.update);
router.delete('/:id', classController.delete);

module.exports = router;