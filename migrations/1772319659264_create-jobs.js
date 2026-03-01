/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
        pgm.createTable('jobs', {
            id: { type: 'serial', primaryKey: true },
            user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'cascade' },
            company: { type: 'varchar(255)', notNull: true },
            position: { type: 'varchar(255)', notNull: true },
            status: { type: 'varchar(50)', notNull: true, default: 'applied' },
            applied_date: { type: 'date', notNull: true, default: pgm.func('current_timestamp') },
            notes: { type: 'text' },
            created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('jobs');
};
