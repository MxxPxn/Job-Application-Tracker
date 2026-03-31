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
  pgm.addColumn("jobs", {
    priority: { type: "varchar(20)", notNull: true, default: "medium" },
    location: { type: "varchar(255)" },
    salary: { type: "varchar(255)" },
    deadline_date: { type: "date" },
    job_url: { type: "varchar(255)" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumn("jobs", [
    "priority",
    "location",
    "salary",
    "deadline_date",
    "job_url",
  ]);
};
