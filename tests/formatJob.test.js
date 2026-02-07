describe('formatJob', () => {
    const { formatJob } = require('../src/data/jobStore');

    test('should format a database row into a job object', () => {
        const dbRow = {
            id: 1,
            company: 'Tech Corp',
            position: 'Software Engineer',
            status: 'applied',
            applied_date: '2024-06-15',
            notes: 'Follow up in two weeks',
            created_at: '2024-06-10T12:00:00Z'
        };

        const expectedJob = {
            id: 1,
            company: 'Tech Corp',
            position: 'Software Engineer',
            status: 'applied',
            appliedDate: '2024-06-15',
            notes: 'Follow up in two weeks',
            createdAt: '2024-06-10T12:00:00Z'
        };

        const formattedJob = formatJob(dbRow);
        expect(formattedJob).toEqual(expectedJob);
    });
});