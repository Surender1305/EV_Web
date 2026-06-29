import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db.json');

// Default initial state
const defaultState = {
  users: [],
  stations: [],
  bookings: [],
  transactions: [],
  notifications: []
};

let data = { ...defaultState };

export const db = {
  get data() {
    return data;
  },
  save() {
    const tempPath = path.join(__dirname, 'db.tmp.json');
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    fs.renameSync(tempPath, dbPath);
  },
  init() {
    if (fs.existsSync(dbPath)) {
      try {
        const fileData = fs.readFileSync(dbPath, 'utf8');
        data = JSON.parse(fileData);
      } catch (err) {
        console.error('Error reading db.json, using default state', err);
        data = { ...defaultState };
        this.save();
      }
    } else {
      console.log('db.json not found. Initializing with default data...');
      data = { ...defaultState };
      this.save();
    }
  }
};

db.init();

export default db;
