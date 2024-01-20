import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book-review",
  password: "MyN3wP0stgres",
  port: 5432,
});
db.connect();

let books = [
  {id: 1,
  title: "Book Title",
  author: "Book Author",
  review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  rating: 5,
  isbn: 9781407109374,
  dateRead: "2022-01-01",
  },
  {id: 2,
    title: "Book Title 2",
    author: "Book Author 2",
    review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    rating: 7,
    isbn: 9780439023481,
    dateRead: "2023-01-01",
    }
];

let searchedBooks = [];

let currentBookId = 1;

function getCurrentBook() {
  return books.find((book) => book.id == currentBookId);
}

async function getBooks() {
  const result = await db.query("SELECT * FROM books");
  books = result.rows;
  return;
}

async function getNotes() {
  const result = await db.query(
    "SELECT note FROM notes JOIN books ON books.id = book_id WHERE book_id = $1;",
    [currentBookId]
  );
  return result.rows
}

async function searchBooks(searchParam) {
  const result = await db.query(
    "SELECT * FROM books WHERE LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($1);",
    ["%" + searchParam + "%"]
  );

  searchedBooks = result.rows;
  return;
}

app.get("/", async (req, res) => {
  await getBooks();
  res.render("index.ejs", {books:books});
});

app.post("/notes", async (req, res) => {
  currentBookId = req.body.bookId;
  const notes = await getNotes();
  console.log(notes);
  const book = getCurrentBook();
  res.render("notes.ejs", {book:book, notes:notes});
});

app.get("/add-book", async (req, res) => {
  res.render("add-book.ejs");
});

app.post("/add-book", async (req, res) => {

  await db.query(
    "INSERT INTO books (title, author, date_read, rating, review, isbn) VALUES ($1, $2, $3, $4, $5, $6);",
    [
      req.body.title,
      req.body.author,
      req.body.dateRead,
      req.body.rating,
      req.body.review,
      req.body.isbn
    ]
  );
  res.redirect("/");
});

app.get("/add-note", async (req, res) => {
  res.render("add-note.ejs");
});

app.post("/add-note", async (req, res) => {

  await db.query(
    "INSERT INTO notes (note, book_id) VALUES ($1, $2);",
    [
      req.body.note,
      currentBookId
    ]
  );
  res.redirect("/");
});

app.get("/search", async (req, res) => {
  res.render("search.ejs", {books:searchedBooks});
});

app.post("/search", async (req, res) => {
  await searchBooks(req.body.searchBox);
  res.redirect("/search");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
