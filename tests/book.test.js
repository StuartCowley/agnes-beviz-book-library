const { expect } = require('chai');
const request = require('supertest');
const { Book, Genre, Author } = require('../src/models');
const app = require('../src/app');

describe('/books', () => {
    before(async () => Book.sequelize.sync());

    beforeEach(async () => {
        await Book.destroy({ where: {} });
    });

    describe('with no records in the database', () => {
        describe('POST /books', () => {
            it('creates a new book in the database', async () => {
                const genre = await Promise.all([
                    Genre.create({
                        genre: 'Period Romance',
                        
                    }),
                ]);

                const author = await Promise.all([
                    Author.create({ 
                        author: 'Jane Austin', 
                    }),
                ]);

                const response = await request(app).post('/books').send({
                    title: 'Pride and Prejudice',
                    AuthorId: `${author[0].dataValues.id}`,
                    GenreId: `${genre[0].dataValues.id}`,
                    ISBN: '9780141439518',
                });

                const newBookRecord = await Book.findByPk(response.body.id, {
                    raw: true,
                });

                expect(response.status).to.equal(201);
                expect(response.body.title).to.equal('Pride and Prejudice');
                expect(newBookRecord.title).to.equal('Pride and Prejudice');
                expect(newBookRecord.AuthorId).to.equal(author[0].dataValues.id);
                expect(newBookRecord.GenreId).to.equal(genre[0].dataValues.id);
                expect(newBookRecord.ISBN).to.equal('9780141439518');
            });

            it('responds with an error message if the book details do not comply with validation and constraints', async () => {
                const noTitle = await request(app).post('/books').send({
                    title: '',
                });
                expect(noTitle.status).to.equal(400);
                expect(noTitle.body.error).to.equal('Please enter a book title');
            });
        });
    });

    describe('with records in the database', () => {
        let genres;
        let authors;
        let books;

        beforeEach(async () => {
            await Book.destroy({ where: {} });
            await Genre.destroy({ where: {} });
            await Author.destroy({ where: {} });

            genres = await Promise.all([
                Genre.create({ genre: 'Thriller' }),
                Genre.create({ genre: 'Fantasy' }),
            ]);

            authors = await Promise.all([
                Author.create({ author: 'Alex Michaelides' }),
                Author.create({ author: 'George R.R. Martin' }),
                Author.create({ author: 'Philip Pullman' }),
            ]);


            books = await Promise.all([
                Book.create({
                    title: 'The Silent Patient', 
                    AuthorId: authors[0].dataValues.id, 
                    GenreId: genres[0].dataValues.id,
                    ISBN: '9780141439518',
                }),

                Book.create({ title: 'A Song of Ice and Fire', AuthorId: authors[1].dataValues.id, GenreId: genres[1].dataValues.id, ISBN: '789789221' }),
                Book.create({ title: 'Northern Lights', AuthorId: authors[2].dataValues.id, GenreId: genres[1].dataValues.id, ISBN: '976575741' }),
            ]);
        });

        describe('GET /books', () => {
            it('gets all book records', async () => {
                const response = await request(app).get('/books');

                expect(response.status).to.equal(200);
                expect(response.body.length).to.equal(3);

                console.log('=====> GET/books response.body', response.body);

                response.body.forEach((book) => {
                    const expected = books.find((a) => a.id === book.id);

                    expect(book.title).to.equal(expected.title);
                    expect(book.AuthorId).to.equal(expected.AuthorId);
                    expect(book.GenreId).to.equal(expected.GenreId);
                    expect(book.ISBN).to.equal(expected.ISBN);

                    expect(book.Author).to.have.own.property('author');
                    expect(book.Genre).to.have.own.property('genre');
                });
            });
        });

        describe('GET /books/:id', () => {
            it('gets book record by id', async () => {
                const book = books[0];
                const response = await request(app).get(`/books/${book.id}`);


                expect(response.status).to.equal(200);
                expect(response.body.title).to.equal(book.title);
                expect(response.body.AuthorId).to.equal(book.AuthorId);
                expect(response.body.GenreId).to.equal(book.GenreId);
                expect(response.body.ISBN).to.equal(book.ISBN);

                expect(response.body.Author).to.have.own.property('author');
                expect(response.body.Genre).to.have.own.property('genre');
            });

            it('returns a 404 if the book does not exist', async () => {
                const response = await request(app).get('/books/12345');

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The book could not be found.');
            });
        });

        describe('PATCH /books/:id', () => {
            it('updates book ISBN by id', async () => {
                const book = books[0];
                const response = await request(app)

                .patch(`/books/${book.id}`)
                .send({ ISBN: 'new87989' });

                const updatedBookRecord = await Book.findByPk(book.id, {
                    raw: true,
                });

                expect(response.status).to.equal(200);
                expect(updatedBookRecord.ISBN).to.equal('new87989');
            });

            it('returns a 404 if the book does not exist', async () => {
                const response = await request(app)
                .patch('/books/12345')
                .send({ ISBN: 'new87989' });

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The book could not be found.');
            });

            it('returns an error message if the update values do not comply with Book validation & constraints', async () => {
                const noTitleUpdate = await request(app)
                .patch('/books/1')
                .send({ title: '' });
                expect(noTitleUpdate.status).to.equal(400);
                expect(noTitleUpdate.body.error).to.equal('Please enter a book title');
            });
        });

        describe('DELETE /books/:id', () => {
            it('deletes book record by id', async () => {
                const book = books[0];
                const response = await request(app).delete(`/books/${book.id}`);
                const deletedBook = await Book.findByPk(book.id, { raw: true });

                expect(response.status).to.equal(204);
                expect(deletedBook).to.equal(null);
            });

            it('returns a 404 if the book does not exist', async () => {
                const response = await request(app).delete('/books/12345');
                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The book could not be found.');
            });
        });
    });
});