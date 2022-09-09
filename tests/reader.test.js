const { expect } = require('chai');
const request = require('supertest');
const { Reader } = require('../src/models');
const app = require('../src/app');

describe('/readers', () => {
    before(async () => Reader.sequelize.sync());

    beforeEach(async () => {
        await Reader.destroy({ where: {} });
    });

    describe('with no records in the database', () => {
        describe('POST /readers', () => {
            it('creates a new reader in the database', async () => {
                const response = await request(app).post('/readers').send({
                    name: 'Elizabeth Bennet',
                    email: 'future_ms_darcy@gmail.com',
                    password: 'supersecret',
                });

                const newReaderRecord = await Reader.findByPk(response.body.id, {
                    raw: true,
                });

                expect(response.status).to.equal(201);
                expect(response.body.name).to.equal('Elizabeth Bennet');
                expect(response.body.password).to.equal(undefined);
                expect(newReaderRecord.name).to.equal('Elizabeth Bennet');
                expect(newReaderRecord.email).to.equal('future_ms_darcy@gmail.com');
                expect(newReaderRecord.password).to.equal('supersecret');
            });
            it('responds with an error message if the reader details do not comply with validation and constraints', async() => {
                const shortPassword = await request(app).post('/readers').send({
                    name: 'Elizabeth Bennet',
                    email: 'future_ms_darcy@gmail.com',
                    password: 'short',
                });
                expect(shortPassword.status).to.equal(400);
                expect(shortPassword.body.error).to.equal('Please enter a password longer than 8 characters');

                const invalidEmail = await request(app).post('/readers').send({
                    name: 'Elizabeth Bennet',
                    email: 'future_ms_darcy@gmailcom',
                    password: 'correctlength',
                });
                expect(invalidEmail.status).to.equal(400);
                expect(invalidEmail.body.error).to.equal('Please enter a valid email address');

                const noName = await request(app).post('/readers').send({
                    name: '',
                    email: 'future_ms_darcy@gmail.com',
                    password: 'correctlength',
                });
                expect(noName.status).to.equal(400);
                expect(noName.body.error).to.equal('Please enter a name');

                const noEmail = await request(app).post('/readers').send({
                    name: 'Elizabeth Bennet',
                    email: '',
                    password: 'correctlength',
                });
                expect(noEmail.status).to.equal(400);
                expect(noEmail.body.error).to.equal('Please enter an email address');

                const noPassword = await request(app).post('/readers').send({
                    name: 'Elizabeth Bennet',
                    email: 'future_ms_darcy@gmail.com',
                    password: '',
                });
                expect(noPassword.status).to.equal(400);
                expect(noPassword.body.error).to.equal('Please enter a password');
            })
        });
    });

    describe('with records in the database', () => {
        let readers;

        beforeEach(async () => {
            readers = await Promise.all([
                Reader.create({
                    name: 'Elizabeth Bennet',
                    email: 'future_ms_darcy@gmail.com',
                    password: 'supersecret',
                }),

                Reader.create({ name: 'Arya Stark', email: 'vmorgul@me.com', password: 'needle_password' }),
                Reader.create({ name: 'Lyra Belacqua', email: 'darknorth123@msn.org', password: 'pantalaimon' }),
            ]);
        });

        describe('GET /readers', () => {
            it('gets all readers records', async () => {
                const response = await request(app).get('/readers');

                expect(response.status).to.equal(200);
                expect(response.body.length).to.equal(3);

                response.body.forEach((reader) => {
                    const expected = readers.find((a) => a.id === reader.id);

                    expect(reader.name).to.equal(expected.name);
                    expect(reader.email).to.equal(expected.email);
                    expect(reader.password).to.equal(undefined);
                });
            });
        });

        describe('GET /readers/:id', () => {
            it('gets readers record by id', async () => {
                const reader = readers[0];
                const response = await request(app).get(`/readers/${reader.id}`);


                expect(response.status).to.equal(200);
                expect(response.body.name).to.equal(reader.name);
                expect(response.body.email).to.equal(reader.email);
                expect(response.body.password).to.equal(undefined);
            });

            it('returns a 404 if the reader does not exist', async () => {
                const response = await request(app).get('/readers/12345');

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The reader could not be found.');
            });
        });

        describe('PATCH /readers/:id', () => {
            it('updates readers email by id', async () => {
                const reader = readers[0];
                const response = await request(app)

                .patch(`/readers/${reader.id}`)
                .send({ email: 'miss_e_bennet@gmail.com' });

                const updatedReaderRecord = await Reader.findByPk(reader.id, {
                    raw: true,
                });

                expect(response.status).to.equal(200);
                expect(response.body.password).to.equal(undefined);
                expect(updatedReaderRecord.email).to.equal('miss_e_bennet@gmail.com');
            });

            it('returns a 404 if the reader does not exist', async () => {
                const response = await request(app)
                .patch('/readers/12345')
                .send({ email: 'some_new_email@gmail.com' });

                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The reader could not be found.');
            });

            it('returns an error message if the update values do not comply with Reader validation & constraints', async () => {
                const shortPasswordUpdate = await request(app)
                .patch('/readers/1')
                .send({ password: 'short' });
                expect(shortPasswordUpdate.status).to.equal(400);
                expect(shortPasswordUpdate.body.error).to.equal('Please enter a password longer than 8 characters');

                const invalidEmailUpdate = await request(app)
                .patch('/readers/1')
                .send({ email: 'email@email' });
                expect(invalidEmailUpdate.status).to.equal(400);
                expect(invalidEmailUpdate.body.error).to.equal('Please enter a valid email address');

                const noNameUpdate = await request(app)
                .patch('/readers/1')
                .send({ name: '' });
                expect(noNameUpdate.status).to.equal(400);
                expect(noNameUpdate.body.error).to.equal('Please enter a name');

                const noEmailUpdate = await request(app)
                .patch('/readers/1')
                .send({ email: '' });
                expect(noEmailUpdate.status).to.equal(400);
                expect(noEmailUpdate.body.error).to.equal('Please enter an email address');

                const noPasswordUpdate = await request(app)
                .patch('/readers/1')
                .send({ password: '' });
                expect(noPasswordUpdate.status).to.equal(400);
                expect(noPasswordUpdate.body.error).to.equal('Please enter a password');

            });
        });

        describe('DELETE /readers/:id', () => {
            it('deletes reader record by id', async () => {
                const reader = readers[0];
                const response = await request(app).delete(`/readers/${reader.id}`);
                const deletedReader = await Reader.findByPk(reader.id, { raw: true });

                expect(response.status).to.equal(204);
                expect(deletedReader).to.equal(null);
            });

            it('returns a 404 if the reader does not exist', async () => {
                const response = await request(app).delete('/readers/12345');
                expect(response.status).to.equal(404);
                expect(response.body.error).to.equal('The reader could not be found.');
            });
        });
    });
});


