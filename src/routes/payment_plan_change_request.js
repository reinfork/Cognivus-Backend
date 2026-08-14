const {authenticateToken: auth} = require('../middleware/auth.js');
const express = require('express');
const {validate} = require('../middleware/sanitizer.js')
const { payment_request: schema } = require('../helper/payload');
const router = express.Router();
const controller = require('../controllers/payment_plan_change_request');

router.use(auth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(schema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;