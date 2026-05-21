const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id/resolve', controller.resolve);

module.exports = router;