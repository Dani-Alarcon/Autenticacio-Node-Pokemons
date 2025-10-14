import express from 'express';
import fs from 'fs';

const router = express.Router();

const readData = () => JSON.parse(fs.readFileSync('./db/db.json'));
const writeData = (data) => fs.writeFileSync('./db/db.json', JSON.stringify(data));

// Funció per obtenir les dades de context (usuari i missatge)
const cogerDatosFormulario = (req, messageType) => {
    const sessionUser = req.session.user;//Coge los datos de la sesion del formulario(se guardan ahi en el middleware del server.js)
    if (!sessionUser || !sessionUser.username) {
        return null; 
    }
    
    const username = sessionUser.username;
    const user = { name: username };
    
    
    let htmlMessage = '';

    if (messageType === 'list') {
        htmlMessage = `<a href="/">Home</a>`;
    } else if (messageType === 'detail' || messageType === 'edit') {
        htmlMessage = `<a href="/products">Llistat de pokemons</a>`;
    }
    
    return { user, htmlMessage };
};
const autenticacio = (req, res, next) => {
    if (!req.session.user || !req.session.user.username) {
        // Redirecciona a l'arrel, que segons server.js, porta a la vista 'login'
        return res.redirect('/'); 
    }
    next();
};

router.get('/', autenticacio,(req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'list');
    const data = readData();
    res.render("products", { user, data, htmlMessage });
});

router.get('/editProducte/:id', autenticacio,(req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'edit');
    
    const data = readData();
    const product = data.products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) return res.status(404).send('Product not found');

    res.render("edit_product", { user, product, htmlMessage });
});

router.get('/:id', autenticacio,(req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'detail');
    
    const data = readData();
    const product = data.products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.render("product", { user, product, htmlMessage });
});

router.post('/', autenticacio,(req, res) => {
    const data = readData();
    const { name, type, generation } = req.body;
    if (!name || !type || !generation) return res.status(400).send('All fields are required');
    const newProduct = { id: data.products.length + 1, name, type, generation };
    data.products.push(newProduct);
    writeData(data);
    res.json(newProduct);
});

router.put('/:id', autenticacio, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const productIndex = data.products.findIndex(p => p.id === id);
    if (productIndex === -1) return res.status(404).send('Product not found');
    data.products[productIndex] = { ...data.products[productIndex], ...req.body };
    writeData(data);
    //res.json({ message: 'Product updated successfully' });
    res.redirect('/products');
});

router.delete('/:id', autenticacio,(req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const productIndex = data.products.findIndex(p => p.id === id);
    if (productIndex === -1) return res.status(404).send('Product not found');
    data.products.splice(productIndex, 1);
    writeData(data);
    res.json({ message: 'Product deleted successfully' });
});

export default router;