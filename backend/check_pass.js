const bcrypt = require('bcrypt');

const hashes = [
  { username: 'admin', hash: '$2b$10$vUr2LZ.Fa6AgbJpviTqqtu0sv5uLvKxmhkyWc4z4aW5F0Z9Z5fpJW' },
  { username: '101', hash: '$2b$10$VW/uEhbkk5q3MgGl0PU8p.L4UEAK37ZkR8s.XDqv/UC3imj2wW.cS' }
];

const passwordsToTry = ['student123', 'password123', 'password', 'dharani', 'dharani05', '123456', '101', '102'];

async function testPasswords() {
  for (const { username, hash } of hashes) {
    for (const pwd of passwordsToTry) {
      if (await bcrypt.compare(pwd, hash)) {
        console.log(`Username: ${username} -> Password is: "${pwd}"`);
        break;
      }
    }
  }
}
testPasswords();
