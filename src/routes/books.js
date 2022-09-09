const express = require('express');
const booksController = require('../controllers/books');

const router = express.Router();

router.post('/', booksController.createBook);

router.get('/', booksController.getAllBooks);
router.get('/:id', booksController.getBookById);

router.patch('/:id', booksController.updateBook);

router.delete('/:id', booksController.deleteBook);

module.exports = router