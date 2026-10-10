const express = require('express');
const router = express.Router();
const {validate} = require('../middleware/sanitizer');
const {ancillary: schema} = require('../helper/payload')
const controller = require('../controllers/ancillary_price');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(schema), controller.create);
router.put('/:id', validate(schema), controller.update);
router.delete('/:id', controller.delete);

module.exports = router;