/**
 * Cleanup script: drops duplicate indexes created by sequelize.sync({ alter: true })
 */
const { sequelize } = require('./config/db');

async function fixIndexes() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL.\n');

    // --- Fix "students" table ---
    const [studentIndexes] = await sequelize.query(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'
         AND INDEX_NAME != 'PRIMARY'
         AND INDEX_NAME NOT IN ('student_id', 'email', 'userId')
       GROUP BY INDEX_NAME`
    );
    console.log(`Found ${studentIndexes.length} duplicate indexes on "students" to drop.`);
    for (const row of studentIndexes) {
      const name = row.INDEX_NAME;
      console.log(`  Dropping: ${name}`);
      await sequelize.query(`ALTER TABLE students DROP INDEX \`${name}\``);
    }

    // --- Fix "users" table ---
    const [userIndexes] = await sequelize.query(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
         AND INDEX_NAME != 'PRIMARY'
         AND INDEX_NAME NOT IN ('username')
       GROUP BY INDEX_NAME`
    );
    console.log(`\nFound ${userIndexes.length} duplicate indexes on "users" to drop.`);
    for (const row of userIndexes) {
      const name = row.INDEX_NAME;
      console.log(`  Dropping: ${name}`);
      await sequelize.query(`ALTER TABLE users DROP INDEX \`${name}\``);
    }

    console.log('\n✅ Index cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();
