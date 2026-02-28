const request = require('supertest');
const app = require ('../src/app');

describe('Job API Endpoints', () => {
    let token;

    beforeAll(async() => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: `testuser${Date.now()}@example.com`,
            password: 'TestPass123!'
        });
        token = res.body.token;
    });

    it ('POST /api/jobs - should create a new job', async () => {
        const res = await request(app)
            .post('/api/jobs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                company: 'Google',
                position: 'developer',
                status: 'applied',
                appliedDate: '2024-03-20',
                notes: 'Excited about this opportunity'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('company', 'Google');
    });

        it('GET /api/jobs - should retrieve all jobs', async () => {
            const res = await request(app)
                .get('/api/jobs')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });

        it('DELETE /api/jobs/:id - should delete a job', async () => {
            // First, create a job to delete
            const createRes = await request(app)
                .post('/api/jobs')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    company: 'Test Company',
                    position: 'Test Position',
                    status: 'applied',
                    appliedDate: '2024-03-20',
                    notes: 'This job will be deleted'
                });
                expect(createRes.statusCode).toEqual(201);

            const jobId = createRes.body.data.id;
            
            const deleteRes = await request(app)
                .delete(`/api/jobs/${jobId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(deleteRes.statusCode).toEqual(200);
            expect(deleteRes.body).toHaveProperty('success', true);
            expect(deleteRes.body.data).toHaveProperty('id', jobId);
        });

});