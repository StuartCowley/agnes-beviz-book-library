const { expect } = require('chai');
const request = require('supertest');
const { Genre } = require('../src/models');
const app = require('../src/app');

describe('/genres', () => {
    before(async () => Genre.sequelize.sync());

    beforeEach(async () => {
        await Genre.destroy({ where: {} });
    });

    describe('with no records in the database', () => {
        describe('POST /genres', () => {
            it('creates a new genre in the database', async () => {
                const response = await request(app).post('/genres').send({
                    genre: 'Fantasy',
                });

                expect(response.status).to.equal(201);
                expect(response.body.genre).to.equal('Fantasy');
            });

            it('responds with an error message if the genre string is empty', async() => {
                const noGenre = await request(app).post('/genres').send({
                    genre: ''
                });
                expect(noGenre.status).to.equal(400);
                expect(noGenre.body.error).to.equal('Please enter a genre');
            })

            it('responds with an error message if a non unique genre is entered', async() => {
                const firstGenre = await request(app).post('/genres').send({
                    genre: 'sci fi'
                });
                const secondGenre = await request(app).post('/genres').send({
                    genre: 'sci fi'
                });

                expect(firstGenre.status).to.equal(201);

                expect(secondGenre.status).to.equal(400);
                expect(secondGenre.body.error).to.equal('There is already an entry for this genre, please enter a new genre or use the existing genre entry');
            })
        });
    });

    describe('with records in the database', () => {
        let genres;

        beforeEach(async () => {
            genres = await Promise.all([
                Genre.create({
                    genre: 'sci fi'
                }),

                Genre.create({ genre: 'fantasy' }),
                Genre.create({ genre: 'thriller' }),
            ]);
        });

        describe('GET /genres', () => {
            it('gets all genres records', async () => {
                const response = await request(app).get('/genres');

                expect(response.status).to.equal(200);
                expect(response.body.length).to.equal(3);

                response.body.forEach((genre) => {
                    const expected = genres.find((a) => a.id === genre.id);

                    expect(genre.genre).to.equal(expected.genre);
                });
            });
        });

        describe('GET /genres/:id', () => {
            it('gets genres record by id', async () => {
                const genre = genres[0];
                const response = await request(app).get(`/genres/${genre.id}`);


                expect(response.status).to.equal(200);
                expect(response.body.genre).to.equal(genre.genre);
            });

            it('returns a 404 if the genre does not exist', async () => {
                const response = await request(app).get('/genres/12345');

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The genre could not be found.');
            });
        });

        describe('PATCH /genres/:id', () => {
            it('updates genres by id', async () => {
                const genre = genres[0];
                const response = await request(app)

                .patch(`/genres/${genre.id}`)
                .send({ genre: 'romance' });

                const updatedGenreRecord = await Genre.findByPk(genre.id, {
                    raw: true,
                });

                expect(response.status).to.equal(200);
                expect(updatedGenreRecord.genre).to.equal('romance');
            });

            it('returns a 404 if the genre does not exist', async () => {
                const response = await request(app)
                .patch('/genres/12345')
                .send({ genre: 'New Genre' });

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The genre could not be found.');
            });

            it('returns an error message if the user tries to update the genre to an empty string', async () => {
                
                const genre = genres[0];
                const emptyStringGenreUpdate = await request(app)
                .patch(`/genres/${genre.id}`)
                .send({ genre: '' });
                expect(emptyStringGenreUpdate.status).to.equal(400);
                expect(emptyStringGenreUpdate.body.error).to.equal('Please enter a genre');
            });

            it('returns an error message if the user tries to update the genre to a value that already exists in the Genre table', async () => {
                const genre = genres[0];
                const nonUniqueGenre = await request(app)
                .patch(`/genres/${genre.id}`)
                .send({ genre: 'thriller' });

                expect(nonUniqueGenre.status).to.equal(400);
                expect(nonUniqueGenre.body.error).to.equal('There is already an entry for this genre, please enter a new genre or use the existing genre entry');
            });
        });

        describe('DELETE /genres/:id', () => {
            it('deletes genre record by id', async () => {
                const genre = genres[0];
                const response = await request(app).delete(`/genres/${genre.id}`);
                const deletedGenre = await Genre.findByPk(genre.id, { raw: true });

                expect(response.status).to.equal(204);
                expect(deletedGenre).to.equal(null);
            });

            it('returns a 404 if the genre does not exist', async () => {
                const response = await request(app).delete('/genres/3333');
                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The genre could not be found.');
            });
        });
    });
});