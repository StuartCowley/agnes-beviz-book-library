const express = require('express');
const authorsController = require('../controllers/authors');

const router = express.Router();

router.post('/', authorsController.createAuthor);

router.get('/', authorsController.getAllAuthors);
router.get('/:id', authorsController.getAuthorById);

router.patch('/:id', authorsController.updateAuthor);

router.delete('/:id', authorsController.deleteAuthor);

module.exports = router