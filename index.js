const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))
const bcrypt = require('bcrypt');

const credentials = {
	host: 'localhost',
	user: 'id21873451_root',
	password: '2626Yaja#',
	database: 'id21873451_loginyajannydb',
    port: 3306
}

app.get('/', (req, res) => {
	res.send('hola desde tu primera ruta de la Api')
})
var connection = mysql.createConnection(credentials)

connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ', err);
    } else {
        console.log('Conexión exitosa a la base de datos!');
        // Aquí puedes realizar otras operaciones con la base de datos si es necesario
    }
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    var connection = mysql.createConnection(credentials);
    /* Hace la consulta a la db para saber si hay algun usario con ese username */
    connection.query("SELECT * FROM login WHERE username = ?", [username], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (result.length > 0) {
                /* si exite ese usuario obtengo el hast guardo en el adb */
                const hashedPassword = result[0].password;

                /* se compara el hast de la db con un nuevo has que se va a crear con el password recientemente dato */
                bcrypt.compare(password, hashedPassword, (error, isMatch) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        /* si hacer match o es igual respondo un 400 */
                        if (isMatch) {
                            res.status(200).send({
                                "id": result[0].id,
                                "user": result[0].user,
                                "username": result[0].username
                            });
                        } else {
                            res.status(400).send('Contraseña incorrecta');
                        }
                    }
                });
            } else {
                res.status(400).send('Usuario no existe');
            }
        }
    });
    connection.end();
});


/* para crear un usuario en la db  */

app.post('/api/register', (req, res) => {
    const { username, password, apellido, nombre, identificacion, telefono, carrera } = req.body;
    let saltRounds=10;
    /* hacemos en los el hast de la contraseña */
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            res.status(500).send(err);
        } else {
            
            const hashedPassword = hash;
    
    let values =[username, hash];
           
   
/* nos conectamos la db  */
    var connection = mysql.createConnection(credentials);
    connection.connect(); // Conectar a la base de datos

    connection.query("SELECT * FROM login WHERE username = ? AND password = ?", values, (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (result.length > 0) {
                res.status(200).send({
                    "id": result[0].id,
                    "user": result[0].user,
                    "username": result[0].username
                });
            } else {
                /*  */
                connection.query("INSERT INTO usuarios (nombre, apellido, telefono, identificacion, carrera) VALUES (?, ?, ?, ?, ?)", [nombre, apellido, telefono, identificacion, carrera], (err, result) => {
                    if (err) {
                        connection.end(); // Asegúrate de cerrar la conexión si hay un error
                        res.status(500).send(err);
                    } else {
                        const userId = result.insertId;
                        connection.query("INSERT INTO login (user, username, password,iduser) VALUES (?, ?, ?,?)", [nombre +""+apellido , username, hashedPassword,userId], (err, result) => {
                            if (err) {
                                connection.end(); // Asegúrate de cerrar la conexión si hay un error
                                res.status(500).send(err);
                            } else {
                                res.status(200).send({
                                    "id": userId,
                                    "user": nombre,
                                    "username": username
                                });
                                connection.end(); // Cerrar la conexión después de completar todas las consultas
                            }
                        });
                    }
                });
            }
        }
    });
   }
   });
});

app.listen(4000, () => console.log('hola soy el servidor'))
