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
    const data = readData();

    res.format({
        json: () => res.json(data),
        html: () => {
            const { user, htmlMessage } = cogerDatosFormulario(req, 'list');
            res.render("pokemons", { user, data, htmlMessage });
        }
    });
});

router.get('/editPokemon/:id', autenticacio, (req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'edit');

    const data = readData();
    
    const pokemon = data.pokemons.find(p => p.id === parseInt(req.params.id));
    if (!pokemon) return res.status(404).send('Pokemon not found');
    res.render("edit_pokemon", { user, pokemon, htmlMessage });
});

router.get('/create', autenticacio, (req, res) => {
    res.render("create_pokemon"); 
});

router.get('/:id', autenticacio, (req, res) => {
    const data = readData();
    const pokemon = data.pokemons.find(p => p.id === parseInt(req.params.id));

    if (!pokemon) return res.status(404).send('Pokemon not found');

    res.format({
        json: () => res.json(pokemon),
        
        html: () => {
            const { user, htmlMessage } = cogerDatosFormulario(req, 'detail');
            res.render("pokemon", { user, pokemon, htmlMessage });
        }
    });
});

router.post('/createPokemon/', autenticacio, (req, res) => {
    try {
        const data = readData();
        const { name, type, generation, imatge } = req.body; 
        const imatgePerDefecte = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg';
        
        if (!name || !type || !generation) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const lastId = data.pokemons.length > 0 ? data.pokemons[data.pokemons.length - 1].id : 0;
        
        const newPokemon = { 
            id: lastId + 1, 
            name, 
            type, 
            generation: parseInt(generation), 
            imatge: (imatge && imatge.trim() !== '') ? imatge : imatgePerDefecte
        };
        
        data.pokemons.push(newPokemon);
        writeData(data);

        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            
            return res.status(201).json(newPokemon);
        } else {
            
            return res.redirect('/pokemons');
        }

    } catch (err) {
        console.error("ERROR:", err);
        
        return res.status(500).json({ error: err.message });
    }
});

router.put('/:id', autenticacio, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const imatgePerDefecte = 'https://png.pngtree.com/png-vector/20240218/ourmid/pngtree-3d-realistrc-pokemon-ball-art-pic-png-image_11751536.png'
    const pokemonIndex = data.pokemons.findIndex(p => p.id === id);
    const imatgeUsuari = req.body.imatge

    if (pokemonIndex === -1) return res.status(404).send('Pokemon not found');

    if(imatgeUsuari == ''){
        req.body.imatge = imatgePerDefecte
    }
    data.pokemons[pokemonIndex] = { ...data.pokemons[pokemonIndex], ...req.body };//copia la informacion que hay en el formulario con req.body y la mete en la base de datos
    writeData(data);
    res.redirect('/pokemons');
});

router.delete('/:id', autenticacio, (req, res) => {
    try {
        const data = readData();
        const id = parseInt(req.params.id);
        const pokemonIndex = data.pokemons.findIndex(p => p.id === id);

        if (pokemonIndex === -1) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }

        data.pokemons.splice(pokemonIndex, 1);
        writeData(data);

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(200).json({ message: 'Pokemon eliminat correctament' });
        } else {
            return res.redirect('/pokemons');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
export default router;