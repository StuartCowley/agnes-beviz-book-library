const validationErrorHandling = require('./helper-fn-validation-error-handling');
const { Book, Reader, Genre, Author } = require('../models');

const get404Error = (model) => ({ error: `The ${model} could not be found.` });

const getModel = (selectedModel) => {
    const models = {
        book: Book,
        reader: Reader,
        genre: Genre,
        author: Author,
    };

    return models[selectedModel];
};

const getOptions = (model) => {
    if (model === 'book') return {
        include: [
            {
                model: Genre,
                required: true
            },
            {
                model: Author,
                required: true
            },
        ]
    };

    if (model === 'genre') return { include: Book }; 

    if (model === 'author') return { include: Book };

    return {};
};

// security feature to prevent password being returned for get requests
const removePassword = (item) => {
    if (item.hasOwnProperty('password')) {
        delete item.password;
    }

    return item;
};

const getAllItems = async (res, model) => {
    const Model = getModel(model);

    const options = getOptions(model);

    const items = await Model.findAll({...options})
        
    const itemsWithoutPassword = items.map((item) => {
        return removePassword(item.get());
    });

    res.status(200).json(itemsWithoutPassword);
};

const createItem = async (res, model, itemData) => {
    const Model = getModel(model);

    try {
        const newItem = await Model.create(itemData);
        const itemWithoutPassword = removePassword(newItem.get());
    
        res.status(201).json(itemWithoutPassword);
    } catch (err) {
        console.log(err);
        const userErrMessage = validationErrorHandling(err); 
        res.status(400).send(userErrMessage); 
    }
};

const updateItem = async (res, model, updateData, id) => {
    const Model = getModel(model);

    try {
        const [ updatedRows ]= await Model.update(updateData, { where: { id } });

        if (!updatedRows) {
            res.status(404).json(get404Error(model));
        } else {
            const updatedItem = await Model.findByPk(id);
            const itemWithoutPassword = removePassword(updatedItem.get());
            res.status(200).json(itemWithoutPassword);
        }
    } catch (err) {
        //console.log(err);
        const userErrMessageUpdate = validationErrorHandling(err);
        res.status(400).send(userErrMessageUpdate);    
    };

};

const getItemById = async (res, model, id) => {
    const Model = getModel(model);

    const options = getOptions(model);

    const item = await Model.findByPk(id, { ...options });

    try {
        if (!item) {
            res.status(404).json(get404Error(model));
        } else {
            const itemWithoutPassword = removePassword(item.dataValues);
            res.status(200).json(itemWithoutPassword);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

const deleteItem = async (res, model, id) => {
    const Model = getModel(model);

    const deletedRows = await Model.destroy({ where: { id } });

    try {
        if (!deletedRows) {
            res.status(404).json(get404Error(model));
        } else {
            res.status(204).send();
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    };
};

module.exports = {
    getAllItems,
    createItem,
    updateItem,
    getItemById,
    deleteItem,
};