// db.js
const ENDPOINT = '/query';

/**
 * Fetch all rows from the given table.
 * You could expand this to handle WHERE, ORDER, etc.
 */
export async function fetchAll(table) {
  const sql = `SELECT * FROM ${table}`;

  console.log('fetchAll', sql)

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch rows from table ${table}: ` + response.statusText);
  }

  const json = response.json();

  return json;
}

/**
 * Insert a new record into the specified table.
 * Dynamically builds an INSERT statement from the object's keys.
 */
export async function createRecord(table, record) {
  const keys = Object.keys(record);
  if (!keys.length) {
    throw new Error('createRecord called with empty record');
  }
  
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  console.log(sql)
  const params = keys.map(k => record[k]);

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params })
  });

  if (!response.ok) {
    throw new Error(`Failed to insert record into table ${table}: ` + response.statusText);
  }

  const json = response.json()

  // The server might return an object with lastInsertRowId or something similar.
  // Adjust as needed if you want to retrieve that info.
  return json;
}
