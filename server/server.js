require('./config/config.js'); //no retorna nada, solo asigna el puerto a la varibale global por eso no se recoje en una vairiable
const express = require('express');
const app = express();

const mongoose = require('mongoose'); //paquete para conectar con mongodb
const bodyParser = require('body-parser'); //requerimos paquete para recibir los paramentros
//const path

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));  
//Para crear las rutas validas
const path = require ('path');
//configuración global de rutas
app.use (require ('./routes/index'));  //Este index tiene todos los requerimientos de routes necesarios


// parse application/json
app.use(bodyParser.json());

//HAbilitando la carpera publica para que sea visible y accible en el browser
app.use(express.static(path.resolve( __dirname,'../public')));
    //ojo, al intentar hacer el path de esta manera se concatena de forma incorrecta, para esto usaremos una libreria ya incuida en node  require ('path');
    // el path.resolve arma el path mandandole los  parametros

// app.get('/', function (req, res) //Es la ruta raíz, localhost:3000/


/*Cargando la bse de datos con mongoose*/
//mongoose.connect('mongodb://localhost:27017/cafe', {  Reemplazado por uns ruta que  funciona remoto o local
mongoose.connect(process.env.URLDB, {    //El process.env.URLDB se configuro en config/config.js
  useNewUrlParser: true,  //Ent la pagina según para usar las nuevas conexiones
  useUnifiedTopology:true,
  useCreateIndex: true
}, (err, res)=>{
  if(err) throw err; //Si el error existe, diferente de undefined, lo lanza
  //Si no existe el error continua con la ejecución
  console.log('Base de Datos online');

}); //El callback0 sirve para procesar  un erro si lo hay o una respuesta si la hay.

app.listen(process.env.PORT, ()=> {
        console.log(`Escuchando el puerto: ${process.env.PORT}`)
    });  //El callback es opcional