const express = require('express');
const readersController = require('../controllers/readers');

const router = express.Router();

router.post('/', readersController.createReader);

router.get('/', readersController.getAllReaders);
router.get('/:id', readersController.getReaderById);

router.patch('/:id', readersController.updateReader);

router.delete('/:id', readersController.deleteReader);

module.exports = router