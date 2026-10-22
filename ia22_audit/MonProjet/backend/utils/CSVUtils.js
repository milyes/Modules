const fs = require('fs');
const csv = require('fast-csv');
const importCSV = (filePath) => {
  const users = [];
  fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => users.push(row))
    .on('end', () => console.log('Import terminé'));
  return users;
};
const exportCSV = (filePath, data) => {
  const ws = fs.createWriteStream(filePath);
  csv.write(data, { headers: true }).pipe(ws);
};
module.exports = { importCSV, exportCSV };
