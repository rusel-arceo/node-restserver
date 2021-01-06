const express = require ('express');  // porque realizaremos peticiones para autenticar
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario =  require ('../models/usuario');

const {OAuth2Client} = require('google-auth-library'); //para verificar el token de google
const client = new OAuth2Client(process.env.CLIENT_ID);  //definido en config/config.js

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

//*************************************************//
//CONFIGURACIONES DE GOOGLE
//*************************************************//

async function verify(token) {  //La función la utillizaremos dentro del post, agregamos el token como argumento. Permite obtener los valores del usuario a partir del token
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //    console.log(payload.name)
    //    console.log(payload.email)
    //    console.log(payload.picture)

    return {
        nombre:  payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
    //const userid = payload['sub']; De la funcion original, no nos sirve
    
  }

  app.post('/google', async (req,res)=>{
    let token = req.body.idtoken; // Este idtoken se envia desde la función que hace signin en google
    
    let googleUser = await verify(token) //Recuerda poner el await o de lo contrario no espera la respuesta
                    .catch( e => { 
                       res.status(403).json({
                           ok: false,
                            err: e
                        });
                    });  //catch

    // res.json({
    //   usuario: googleUser
    //body: req.body
    //});
    
    Usuario.findOne( { email: googleUser.email }, (err, usuarioBD) => {
        if(err)
        {
            console.log('Error al intentar buscar el usuario');

            return res.status(500).json({ //500 error interno del servidor
                ok: false,
                errerr: {
                    message:"Error al buscar el usuario en la BD"
                }
             });
        }

        if(usuarioBD)  //Si existe. puede estar ya registrado de forma normal o por google
        { 
            console.log('El usuario existe', usuarioBD);

            if(usuarioBD.google === false)
            {
                console.log('El usuario No se creo con google');

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Sus datos ya cuentan con una cuenta tradicional, inicie sesión de forma tradicional"
                    }
                });
            }
            else{ // SI previamente se había autenticado con google, le generamos un token de nuestra app
                console.log('Se se creado con GOOGLE', usuarioBD );
                let token = jwt.sign(
                    { usuario: usuarioBD },
                       process.env.SEED,
                       {expiresIn: 60*60*24*30}  //seg*min*hrs*days
                       //    {expiresIn: process.env.CADUCIDAD_TOKEN}  //seg*min*hrs*days
                   );
       
                return res.json({
                   ok: true,
                   usuario:usuarioBD,
                   token, //token: token
                 })
            }
        }else{ //SI es usuario no existe en la BD, se creará un nuevo usario
            console.log('El usuario No existe, se crea uno nuevo');
            let usuario = new Usuario ();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //Según el instructo nunca va a hacer match, solo es para pasar la restricción de obligatoriedad. Porque no la estamos encriptando, al querer hacer login se va a incriptar y nunca va a corresponder

            usuario.save(usuario, (err, usuarioBD) => {
                if(err)
                {
                    return res.status(500).json({ //500 error interno del servidor
                        ok: false,
                         err: {
                            message:"El ususario no existe pero se produjo un error al crearlo"
                        }
                     });
                }

                let token = jwt.sign(
                    { usuario: usuarioBD },
                       process.env.SEED,
                       {expiresIn: 60*60*24*30}  //seg*min*hrs*days
                       //    {expiresIn: process.env.CADUCIDAD_TOKEN}  //seg*min*hrs*days
                   );
       
               return res.json({
                   ok: true,
                   usuario: usuarioBD,
                   token, //token: token
               });
            });
        } //else

    }); //Buscamos si es usario ya esta en la base de datos o al menos su email

});



module.exports = app;