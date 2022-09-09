const express = require('express');
const readersRouter = require('./routes/readers');
const booksRouter = require('./routes/books');
const genresRouter = require('./routes/genres');
const authorsRouter = require('./routes/authors');

const app = express();

app.use(express.json());

app.use('/readers', readersRouter);
app.use('/books', booksRouter);
app.use('/genres', genresRouter);
app.use('/authors', authorsRouter);

module.exports = app;