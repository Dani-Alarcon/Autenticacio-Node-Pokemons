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
        htmlMessage = `<a href="/pokemons">Llistat de pokemons</a>`;
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

router.get('/', autenticacio, (req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'list');
    const data = readData();
    
    res.render("pokemons", { user, data, htmlMessage });
});

router.get('/editPokemon/:id', autenticacio, (req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'edit');

    const data = readData();
    
    const pokemon = data.pokemons.find(p => p.id === parseInt(req.params.id));
    if (!pokemon) return res.status(404).send('Pokemon not found');
    res.render("edit_pokemon", { user, pokemon, htmlMessage });
});

router.get('/:id', autenticacio, (req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'detail');

    const data = readData();
    const pokemon = data.pokemons.find(p => p.id === parseInt(req.params.id));
    if (!pokemon) return res.status(404).send('Pokemon not found');

    res.render("pokemon", { user, pokemon, htmlMessage });
});

router.post('/', autenticacio, (req, res) => {
    const data = readData();
    const { name, type, generation } = req.body;
    if (!name || !type || !generation) return res.status(400).send('All fields are required');
    const newPokemon = { id: data.pokemons.length + 1, name, type, generation };
    data.pokemons.push(newPokemon);
    writeData(data);
    res.json(newPokemon);
});

router.put('/:id', autenticacio, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const pokemonIndex = data.pokemons.findIndex(p => p.id === id);

    if (pokemonIndex === -1) return res.status(404).send('Pokemon not found');

    data.pokemons[pokemonIndex] = { ...data.pokemons[pokemonIndex], ...req.body };
    writeData(data);
    //res.json({ message: 'Pokemon updated successfully' });
    res.redirect('/pokemons');
});

router.delete('/:id', autenticacio, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);

    const pokemonIndex = data.pokemons.findIndex(p => p.id === id);

    if (pokemonIndex === -1) return res.status(404).send('Pokemon not found');


    data.pokemons.splice(pokemonIndex, 1);
    writeData(data);

    res.json({ message: 'Pokemon deleted successfully' });
});
export default router;