const { expect } = require('chai');
const request = require('supertest');
const { Author } = require('../src/models');
const app = require('../src/app');

describe('/authors', () => {
    before(async () => Author.sequelize.sync());

    beforeEach(async () => {
        await Author.destroy({ where: {} });
    });

    describe('with no records in the database', () => {
        describe('POST /authors', () => {
            it('creates a new author in the database', async () => {
                const response = await request(app).post('/authors').send({
                    author: 'Octavia E. Butler',
                });

                expect(response.status).to.equal(201);
                expect(response.body.author).to.equal('Octavia E. Butler');
            });

            it('responds with an error message if the author string is empty', async() => {
                const noAuthor = await request(app).post('/authors').send({
                    author: ''
                });
                expect(noAuthor.status).to.equal(400);
                expect(noAuthor.body.error).to.equal('Please enter the author of the book');
            })

            it('responds with an error message if a non unique author is entered', async() => {
                const firstAuthor = await request(app).post('/authors').send({
                    author: 'Brandon Sanderson'
                });
                const secondAuthor = await request(app).post('/authors').send({
                    author: 'Brandon Sanderson'
                });

                expect(firstAuthor.status).to.equal(201);

                expect(secondAuthor.status).to.equal(400);
                expect(secondAuthor.body.error).to.equal('There is already an entry for this author, please enter a new author or use the existing author entry');
            })
        });
    });

    describe('with records in the database', () => {
        let authors;

        beforeEach(async () => {
            authors = await Promise.all([
                Author.create({
                    author: 'Octavia E. Butler'
                }),

                Author.create({ author: 'Brandon Sanderson' }),
                Author.create({ author: 'Angie Thomas' }),
            ]);
        });

        describe('GET /authors', () => {
            it('gets all authors records', async () => {
                const response = await request(app).get('/authors');

                expect(response.status).to.equal(200);
                expect(response.body.length).to.equal(3);

                response.body.forEach((author) => {
                    const expected = authors.find((a) => a.id === author.id);

                    expect(author.author).to.equal(expected.author);
                });
            });
        });

        describe('GET /authors/:id', () => {
            it('gets authors record by id', async () => {
                const author = authors[0];
                const response = await request(app).get(`/authors/${author.id}`);


                expect(response.status).to.equal(200);
                expect(response.body.author).to.equal(author.author);
            });

            it('returns a 404 if the author does not exist', async () => {
                const response = await request(app).get('/authors/12345');

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The author could not be found.');
            });
        });

        describe('PATCH /authors/:id', () => {
            it('updates authors by id', async () => {
                const author = authors[0];
                const response = await request(app)

                .patch(`/authors/${author.id}`)
                .send({ author: 'Lewis Carroll' });

                const updatedAuthorRecord = await Author.findByPk(author.id, {
                    raw: true,
                });

                expect(response.status).to.equal(200);
                expect(updatedAuthorRecord.author).to.equal('Lewis Carroll');
            });

            it('returns a 404 if the author does not exist', async () => {
                const response = await request(app)
                .patch('/authors/12345')
                .send({ author: 'New Author' });

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The author could not be found.');
            });

            it('returns an error message if the user tries to update the author to an empty string', async () => {
                
                const author = authors[0];
                const emptyStringAuthorUpdate = await request(app)
                .patch(`/authors/${author.id}`)
                .send({ author: '' });
                expect(emptyStringAuthorUpdate.status).to.equal(400);
                expect(emptyStringAuthorUpdate.body.error).to.equal('Please enter the author of the book');
            });

            it('returns an error message if the user tries to update the author to a value that already exists in the Author table', async () => {
                const author = authors[0];
                const nonUniqueAuthor = await request(app)
                .patch(`/authors/${author.id}`)
                .send({ author: 'Angie Thomas' });

                expect(nonUniqueAuthor.status).to.equal(400);
                expect(nonUniqueAuthor.body.error).to.equal('There is already an entry for this author, please enter a new author or use the existing author entry');
            });
        });

        describe('DELETE /authors/:id', () => {
            it('deletes author record by id', async () => {
                const author = authors[0];
                const response = await request(app).delete(`/authors/${author.id}`);
                const deletedAuthor = await Author.findByPk(author.id, { raw: true });

                expect(response.status).to.equal(204);
                expect(deletedAuthor).to.equal(null);
            });

            it('returns a 404 if the author does not exist', async () => {
                const response = await request(app).delete('/authors/3333');
                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The author could not be found.');
            });
        });
    });
});