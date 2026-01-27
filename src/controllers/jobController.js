const jobStore = require('../data/jobStore');

const VALID_STATUSES = ['applied', 'interview', 'offer', 'rejected'];

const createJob = (req, res) => {
    const {company, position, status, appliedDate, notes} = req.body;

    const errors = [];
    if (!company || typeof company !== 'string') {                   
      errors.push('company is required and must be a string');       
    }                                                                
    if (!position || typeof position !== 'string') {                 
      errors.push('position is required and must be a string');      
    }                                                                
    if (!status || !VALID_STATUSES.includes(status)) {               
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);                                                             
    }                                                                
    if (!appliedDate || isNaN(Date.parse(appliedDate))) {            
      errors.push('appliedDate is required and must be a valid date');                                                            
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    //create the job
    const job = jobStore.addJob({
        company: company.trim(),
        position: position.trim(),
        status,
        appliedDate,
        notes: notes ? notes.trim() : ''
    });

    res.status(201).json({ success: true, data:job });
};

const getJobs = (req, res) => {
  const jobs = jobStore.getAllJobs();
  res.json({ success: true, data: jobs });
};

const getJobById =(req, res) => {
    const job = jobStore.getJobById(req.params.id);
    if (!job){
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
  };

module.exports = {
    createJob,
    getJobs,
    getJobById
};