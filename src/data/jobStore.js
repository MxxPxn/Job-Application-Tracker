
const pool = require('../db/connection');

const fieldMap = {
    company: 'company',
    position: 'position',
    status: 'status',
    location: 'location',
    salary: 'salary',
    deadlineDate: 'deadline_date',
    jobUrl: 'job_url',
    priority: 'priority',
    appliedDate: 'applied_date',
    notes: 'notes'
};

const formatJob = (row) => {
    return {
        id: row.id,
        company: row.company,
        position: row.position,
        status: row.status,
        priority: row.priority,
        location: row.location,
        salary: row.salary,
        deadlineDate: row.deadline_date,
        jobUrl: row.job_url,
        appliedDate: row.applied_date,
        notes: row.notes,
        createdAt: row.created_at,
    };
}


const addJob = async (jobData) => {
    const result = await pool.query(
        'INSERT INTO jobs (company, position, location, salary, deadline_date, job_url, status, applied_date, notes, user_id, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [jobData.company, jobData.position, jobData.location, jobData.salary, jobData.deadlineDate, jobData.jobUrl, jobData.status, jobData.appliedDate, jobData.notes, jobData.user_id, jobData.priority]
    )
    return formatJob(result.rows[0]);
};

const getJobById = async(id, userId) => {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rows.length === 0) {
        return null;
    }
    return formatJob(result.rows[0]);
}

const updateJob = async (id, userId, updateData) => {
   const keys = Object.keys(updateData);
   const values = Object.values(updateData);
   const setClause = keys.map((key, index) => `${fieldMap[key]} = $${index + 1}`).join(', ');
   
   const query = `UPDATE jobs SET ${setClause} WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`;
   const result = await pool.query(query, [...values, id, userId]);
    if (result.rows.length === 0) { 
        return null;
    }
   return formatJob(result.rows[0]);
}

const deleteJob = async (id, userId) => {
    const result = await pool.query('DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) {
        return null;
    }
    return formatJob(result.rows[0]);
}

const getAllJobs = async (filter, limit, offset) => {
    const conditions = ['user_id = $1'];
    const values = [filter.userId];

        if (filter.status) {
            conditions.push(`status = $${values.length + 1}`);
            values.push(filter.status);
        }

    const query = `SELECT * FROM jobs WHERE ${conditions.join(' AND ')} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const queryTotal = `SELECT COUNT(*) FROM jobs WHERE ${conditions.join(' AND ')}`;
    const tottalResult  = await pool.query(queryTotal, values);
    const total = parseInt(tottalResult.rows[0].count, 10);

    const resultQuery = await pool.query(query, [...values, limit, offset]);
    return { jobs: resultQuery.rows.map(formatJob), total };
};

module.exports = {
    addJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob, 
    formatJob
    };
