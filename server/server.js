require('./config/config.js'); //no retorna nada, solo asigna el puerto a la varibale global por eso no se recobe en una vairiable
const express = require('express');
const app = express();

const bodyParser = require('body-parser'); //requerimos

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));  

// parse application/json
app.use(bodyParser.json());

 
// app.get('/', function (req, res) //Es la ruta raíz, localhost:3000/

app.get('/usuario', function (req, res) {
      res.json('Esta es peticion get de /usuario'); //SI usamos .sen, lo manda como html, con .json lo masnda en json
    });

app.post('/usuario', function (req, res) {
     let body = req.body; //aparece cuando el body parse procese las peticiones, funciona para los 4 tipos de petición
     if(body.nombre===undefined)
    {
      res.status(400).json(   //El estado de la petición, ver pdf con estados
        {   //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
          ok:'false',
          mensaje:'El nombre el necesio'
        });
    }
    else{
      res.json( { persona : body } ); //SI usamos .sen, lo manda como html, con .json lo manda en json
     }
  }); //fin de la función post


    app.put('/usuario/:id', function (req, res) {
      let id = req.params.id;
      res.json( 
        {
          id  //Esto es unu objeto que se pasará en foprmato json, donde la 
        }  //propiedad id, recibe el parametro id. id:id, en ECMAScript 6 se pone solo id
        
      );
      //SI usamos .sen, lo manda como html, con .json lo masnda en json
    });

app.delete('/usuario', function (req, res) {
      res.json('Esta es una peticion delete de /usuario'); //SI usamos .sen, lo manda como html, con .json lo masnda en json
    });

app.listen(process.env.PORT, ()=> {
        console.log(`Escuchado el pueto: ${process.env.PORT}`)
    });  //El callback es opcional