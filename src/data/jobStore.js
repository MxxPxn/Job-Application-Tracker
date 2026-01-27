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

const getJobById =(id) => {
    return jobs.find(job => job.id === parseInt(id));
}

const getAllJobs =() => jobs;

module.exports = {
    addJob,
    getAllJobs,
    getJobById     
    };
