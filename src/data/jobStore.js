

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

const updateJob = (id, updateData) => {
    const job = getJobById(id);
    if (job) {
        Object.assign(job, updateData);
        return job;
    }
}

const deleteJob = (id) => {
    const index = jobs.findIndex(job => job.id === parseInt(id));
    if (index !== -1) {
        return jobs.splice(index, 1)[0];
    }
}

const getAllJobs =() => jobs;

module.exports = {
    addJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob, 
    };
