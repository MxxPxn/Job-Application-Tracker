const pool = require('../db/connection');

const create = async (userId, tokenHash, expiresAt) => {
  const result = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
};

const findByTokenHash = async (tokenHash) => {
  const result = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash]
  );
  return result.rows[0];
};

const deleteByTokenHash = async (tokenHash) => {
  await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
};

module.exports = { create, findByTokenHash, deleteByTokenHash };
