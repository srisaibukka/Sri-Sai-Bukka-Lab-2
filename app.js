const express = require("express");
const dbPromise = require("./db");

const app = express();

app.use(express.json());

const PORT = 3000;

let db;

// GET: Retrieve all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all("SELECT * FROM book;");
    response.send(books);
  } catch (error) {
    response.status(500).send("Server error");
  }
});

// GET: Retrieve one book
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?;",
      [bookId]
    );

    if (book === undefined) {
      response.status(404).send("Book not found");
    } else {
      response.send(book);
    }
  } catch (error) {
    response.status(500).send("Server error");
  }
});

// POST: Add a book
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?);`,
      [title, author, price, pages]
    );

    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).send("Server error");
  }
});

// PUT: Update a book
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?;`,
      [title, author, price, pages, bookId]
    );

    if (result.changes === 0) {
      response.status(404).send("Book not found");
    } else {
      response.send("Book updated successfully");
    }
  } catch (error) {
    response.status(500).send("Server error");
  }
});

// DELETE: Remove a book
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const result = await db.run(
      "DELETE FROM book WHERE id = ?;",
      [bookId]
    );

    if (result.changes === 0) {
      response.status(404).send("Book not found");
    } else {
      response.send("Book deleted successfully");
    }
  } catch (error) {
    response.status(500).send("Server error");
  }
});

// Initialize database and start server
const initializeDBAndServer = async () => {
  try {
    db = await dbPromise;

    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();