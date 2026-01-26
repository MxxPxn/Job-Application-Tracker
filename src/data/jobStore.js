const jobs = [];
let nextId = 1;

const addJob = (jobData) => {
    const job = {
        id: nextId++,
        ...jobData,
        createdAt: new Date().toISOString()
    };
    jobs.push(job);
    return job;
};

const getAllJobs =() => jobs;

module.exports = {
    addJob,
    getAllJobs      
    };
