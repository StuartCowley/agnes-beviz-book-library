const express = require('express');
const genresController = require('../controllers/genres');

const router = express.Router();

router.post('/', genresController.createGenre);

router.get('/', genresController.getAllGenres);
router.get('/:id', genresController.getGenreById);

router.patch('/:id', genresController.updateGenre);

router.delete('/:id', genresController.deleteGenre);

module.exports = router