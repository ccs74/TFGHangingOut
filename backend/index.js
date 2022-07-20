const express = require('express');
const cors = require('cors');
const app = express();
const { conexionBD } = require("./database/configdb");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
conexionBD();

require('dotenv').config();


app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.use(cors());
app.use(express.json());


app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ' + process.env.PORT);
});

app.use(fileUpload({
    limits: { fileSize: process.env.MAXSIZEUPLOAD * 1024 * 1024 },
}));

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/actividades', require('./routes/actividades'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/provincias', require('./routes/provincias'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/mensajes', require('./routes/mensajes'));
app.use('/api/valoraciones', require('./routes/valoraciones'));
app.use('/api/incidencias', require('./routes/incidencias'));