const {
    getAllItems,
    createItem,
    updateItem,
    getItemById,
    deleteItem,
} = require('./helper-fn-CRUD-operations');

const getAllGenres = (_, res) => getAllItems(res, 'genre');

const createGenre = (req, res) => createItem(res, 'genre', req.body);

const updateGenre = (req, res) =>
updateItem(res, 'genre', req.body, req.params.id);

const getGenreById = (req, res) => getItemById(res, 'genre', req.params.id);

const deleteGenre = (req, res) => deleteItem(res, 'genre', req.params.id);

module.exports = {
    getAllGenres,
    createGenre,
    updateGenre,
    getGenreById,
    deleteGenre,
};