import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = './db.json';
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function fixPasswords() {
  for (let user of dbData.users) {
    const plain = user.plainPassword || 'password123';
    user.plainPassword = plain;
    user.password = await bcrypt.hash(plain, 10);
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  console.log('Passwords fixed and synced!');
}

fixPasswords();
