const mysql = require('mysql2/promise');
const fs = require('fs');

async function dump() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dharani05',
    database: 'student_academic_repo'
  });

  const [students] = await connection.execute('SELECT * FROM Students');
  const [records] = await connection.execute('SELECT * FROM AcademicRecords');
  const [users] = await connection.execute('SELECT * FROM Users');

  fs.writeFileSync('old_data.json', JSON.stringify({ students, records, users }, null, 2));
  console.log('Done mapping old info');
  process.exit();
}
dump();
