const request = require('supertest');
const app = require ('../src/app');

describe('Job API Endpoints', () => {
    it ('POST /api/jobs - should create a new job', async () => {
        const res = await request(app)
            .post('/api/jobs')
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
            const res = await request(app).get('/api/jobs');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('DELETE /api/jobs/:id - should delete a job', async () => {
            // First, create a job to delete
            const createRes = await request(app)
                .post('/api/jobs')
                .send({
                    company: 'Test Company',
                    position: 'Test Position',
                    status: 'applied',
                    appliedDate: '2024-03-20',
                    notes: 'This job will be deleted'
                });
                expect(createRes.statusCode).toEqual(201);

            const jobId = createRes.body.data.id;
            
            const deleteRes = await request(app).delete(`/api/jobs/${jobId}`);
            expect(deleteRes.statusCode).toEqual(200);
            expect(deleteRes.body).toHaveProperty('success', true);
            expect(deleteRes.body.data).toHaveProperty('id', jobId);
        });

});