// db.js

const endpoint = '/query'; // Change if your server is on a different path

/**
 * Fetch all books from the "books" table.
 */
export async function getBooks() {
  const sql = 'SELECT * FROM books';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    throw new Error(`Error fetching books: ${response.status} ${response.statusText}`);
  }

  // The server returns rows as JSON. For example: [{id:1, title:"...", author:"...", year:...}, ...]
  return response.json();
}

/**
 * Add a new book record (id auto-incremented by the DB).
 */
export async function addBook({ title, author, year }) {
  const sql = 'INSERT INTO books (title, author, year) VALUES (?, ?, ?)';
  const params = [title, author, year];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params })
  });

  if (!response.ok) {
    throw new Error(`Error adding book: ${response.status} ${response.statusText}`);
  }

  // If your server returns the newly inserted row or just a success message,
  // parse it here. We'll assume it returns something like: { success: true, rowId: X }.
  return response.json();
}
