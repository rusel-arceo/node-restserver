const express = require ('express');  // porque realizaremos peticiones para autenticar
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario =  require ('../models/usuario');

require('../config/config.js');

const app = express();

//Crearemos una peticion post para la uatentcación
//Tenemos que cargarlo en el sever

app.post('/login',(req,res)=>{
    
    let body = req.body; //obtenermos los parametros (email y passeord)
    
    Usuario.findOne({email:body.email}, (err,usuarioDB)=>{
       if (err)
       {
           return res.status(500).json({
               ok: false,
               message: "Ocurrio un error al intentar acceder a la BD, intente más tarde, si el error continua reportelo con su admin de tecnologías",
               err               
           });
        }         

        if( !usuarioDB ) //SI no envio usuario, ! sería tru
        {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "(usuario) o contraseña incorrectos"
                }
            });
        }

        //verificando la contraseña
        if(!bcrypt.compareSync(body.password, usuarioDB.password)) 
        {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "usuario o (contraseña) incorrectos"
                }
            });
        }
/* Ejemplo general
    jwt.sign({
    data: 'foobar'
    }, 'secret', { expiresIn: 60 * 60 });
 */
         let token = jwt.sign(
             { usuario: usuarioDB },
                process.env.SEED,
                {expiresIn: 60*60*24*30}  //seg*min*hrs*days
                //    {expiresIn: process.env.CADUCIDAD_TOKEN}  //seg*min*hrs*days
            );

        res.json({
            ok: true,
            usuario: usuarioDB,
            token //token: token
        })
        //Lo que hace es tomar la contraseña, encriptarla y verifica si conicide con el ususario que se supone se ha encontrad en este punto y esta en usuarioDB. Como nos  interes mandar el erro, usaremos la negación.

    })  //Buscamos un elementos y le mandamos la condición 
   
}); //fiind de post login

module.exports = app;