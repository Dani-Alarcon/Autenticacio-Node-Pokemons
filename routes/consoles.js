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
        htmlMessage = `<a href="/consoles">Llistat de consoles</a>`;
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
    
    res.render("consoles", { user, data, htmlMessage });
});

router.get('/editConsola/:id', autenticacio, (req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'edit');

    const data = readData();
    
    const consola = data.consoles.find(p => p.id === parseInt(req.params.id));
    if (!consola) return res.status(404).send('Consola not found');
    res.render("edit_consola", { user, consola, htmlMessage });
});

router.get('/create', autenticacio, (req, res) => {
    res.render("create_consola"); 
});

router.get('/:id', autenticacio, (req, res) => {
    const { user, htmlMessage } = cogerDatosFormulario(req, 'detail');

    const data = readData();
    const consola = data.consoles.find(p => p.id === parseInt(req.params.id));
    if (!consola) return res.status(404).send('Consola not found');

    res.render("consola", { user, consola, htmlMessage });
});

router.post('/createConsola/', autenticacio, (req, res) => {
    const data = readData();
    const { name, year, imatge } = req.body; 
    const imatgePerDefecte = 'https://png.pngtree.com/png-vector/20240218/ourmid/pngtree-3d-realistrc-consola-ball-art-pic-png-image_11751536.png'
    
    if (!name || !type || !generation) return res.status(400).send('Falten camps obligatoris');
    
    const newConsola = { 
        id: data.consoles.length + 1, 
        name, 
        year,
        imatge: imatge || imatgePerDefecte
    };
    
    data.consoles.push(newConsola);
    writeData(data);
    res.redirect('/consoles');
});

router.put('/:id', autenticacio, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const imatgePerDefecte = 'https://png.pngtree.com/png-vector/20240218/ourmid/pngtree-3d-realistrc-consola-ball-art-pic-png-image_11751536.png'
    const consolaIndex = data.consoles.findIndex(p => p.id === id);
    const imatgeUsuari = req.body.imatge

    if (consolaIndex === -1) return res.status(404).send('Consola not found');

    if(imatgeUsuari == ''){
        req.body.imatge = imatgePerDefecte
    }
    data.consoles[consolaIndex] = { ...data.consoles[consolaIndex], ...req.body };//copia la informacion que hay en el formulario con req.body y la mete en la base de datos
    writeData(data);
    res.redirect('/consoles');
});

router.delete('/:id', autenticacio, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);

    const consolaIndex = data.consoles.findIndex(p => p.id === id);

    if (consolaIndex === -1) return res.status(404).send('Consola not found');


    data.consoles.splice(consolaIndex, 1);
    writeData(data);


    res.redirect('/consoles');
});
export default router;