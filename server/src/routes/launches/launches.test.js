const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Testing launches Api', () => {

    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();

    });

    afterAll(async () => {
        console.log('Test finished');
        await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success and header type of json', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200)
        })
    })


    describe('Test POST /launch', () => {

        const completeLaunchData = {
            mission: 'test',
            rocket: 'test',
            launchDate: 'january 5, 2050',
            target: 'Kepler-62 f'

        }

        const launchDataWithoutDate = {
            mission: 'test',
            rocket: 'test',
            target: 'Kepler-62 f'

        }
        const launchDataWithInvalidDate = {
            mission: 'test',
            rocket: 'test',
            launchDate: 'FUck',
            target: 'Kepler-62 f'

        }
        test('It should respond with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);


            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            // expect(requestDate).toBe(responseDate);
            // expect(response.body).toBe(completeLaunchData);
            // expect(response.body.success).toBe(true);

        });

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            })

        });


        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        });
    })

})

