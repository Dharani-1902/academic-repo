const mysql = require('mysql2/promise');
const fs = require('fs');

async function readMySql() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dharani05',
    database: 'student_academic_repo'
  });

  const [students] = await connection.execute('SELECT student_id, name, department, year FROM Students');
  const [users] = await connection.execute('SELECT username, password FROM Users');

  const data = { students, users };
  fs.writeFileSync('mysql_output.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('wrote mysql_output.json');
  process.exit();
}
readMySql();
