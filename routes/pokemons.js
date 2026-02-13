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
   
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ error: 'Cal iniciar sessió per accedir' });
    }

    try {
       
        next();
    } catch (error) {
        res.clearCookie("access_token");
        return res.status(401).json({ error: 'Sessió caducada' });
    }
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
    try {
        const data = readData();
        const id = parseInt(req.params.id);
        const imatgePerDefecte = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg';
        const pokemonIndex = data.pokemons.findIndex(p => p.id === id);

        if (pokemonIndex === -1) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }

        if (req.body.imatge === '') {
            req.body.imatge = imatgePerDefecte;
        }

        data.pokemons[pokemonIndex] = { ...data.pokemons[pokemonIndex], ...req.body };
        writeData(data);

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(200).json(data.pokemons[pokemonIndex]);
        } else {
            return res.redirect('/pokemons');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
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