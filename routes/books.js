import express from 'express';
import fs from 'fs';

const router = express.Router();

const readData = () => JSON.parse(fs.readFileSync('./db/db.json'));
const writeData = (data) => fs.writeFileSync('./db/db.json', JSON.stringify(data));

router.get('/', (req, res) => {
    const data = readData();
    const user = { name: "Francesc" };
    const htmlMessage = `<p>Aquest és un text <strong>amb estil</strong> i un enllaç:</p>
                         <a href="/">Home</a>`;
    res.render("book", { user, data, htmlMessage });
});

router.get('/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const book = data.books.find(book => book.id === id);
    if (!book) return res.status(404).send('Book not found');
    res.json(book);
});

router.post('/', (req, res) => {
    const data = readData();
    const body = req.body;
    const newBook = { id: data.books.length + 1, ...body };
    data.books.push(newBook);
    writeData(data);
    res.json(newBook);
});

router.put('/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex(book => book.id === id);
    if (bookIndex === -1) return res.status(404).send('Book not found');
    data.books[bookIndex] = { ...data.books[bookIndex], ...req.body };
    writeData(data);
    res.json({ message: "Book updated successfully" });
});

router.delete('/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex(book => book.id === id);
    if (bookIndex === -1) return res.status(404).send('Book not found');
    data.books.splice(bookIndex, 1);
    writeData(data);
    res.json({ message: "Book deleted successfully" });
});

export default router;
