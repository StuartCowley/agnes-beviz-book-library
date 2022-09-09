const {
    getAllItems,
    createItem,
    updateItem,
    getItemById,
    deleteItem,
} = require('./helper-fn-CRUD-operations');

const getAllReaders = (_, res) => getAllItems(res, 'reader');

const createReader = (req, res) => createItem(res, 'reader', req.body);

const updateReader = (req, res) =>
updateItem(res, 'reader', req.body, req.params.id);

const getReaderById = (req, res) => getItemById(res, 'reader', req.params.id);

const deleteReader = (req, res) => deleteItem(res, 'reader', req.params.id);

module.exports = {
    getAllReaders,
    getReaderById,
    createReader,
    updateReader,
    deleteReader,
};