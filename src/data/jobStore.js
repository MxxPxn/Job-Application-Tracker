
const pool = require('../db/connection');

const fieldMap = {
    company: 'company',
    position: 'position',
    status: 'status',
    appliedDate: 'applied_date',
    notes: 'notes'
};

const formatJob = (row) => {
    return {
        id: row.id,
        company: row.company,
        position: row.position,
        status: row.status,
        appliedDate: row.applied_date,
        notes: row.notes,
        createdAt: row.created_at,
    };
}


const addJob = async (jobData) => {
    const result = await pool.query(
        'INSERT INTO jobs (company, position, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [jobData.company, jobData.position, jobData.status, jobData.appliedDate, jobData.notes]
    )
    return formatJob(result.rows[0]);
};

const getJobById = async(id) => {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        return null;
    }
    return formatJob(result.rows[0]);
}

const updateJob = async (id, updateData) => {
   const keys = Object.keys(updateData);
   const values = Object.values(updateData);
   const setClause = keys.map((key, index) => `${fieldMap[key]} = $${index + 1}`).join(', ');
   
   const query = `UPDATE jobs SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
   const result = await pool.query(query, [...values, id]);
    if (result.rows.length === 0) { 
        return null;
    }
   return formatJob(result.rows[0]);
}

const deleteJob = async (id) => {
    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
        return null;
    }
    return formatJob(result.rows[0]);
}

const getAllJobs = async () => {
    const result = await pool.query('SELECT * FROM jobs');
    return result.rows.map(formatJob);
};

module.exports = {
    addJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob, 
    formatJob
    };
