const express = require('express');
const Usuario = require ('../models/usuario');
const bcrypt = require('bcrypt');
//const usuario = require('../models/usuario');
const _ = require ('underscore');

const {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion'); //La requerimos y desagregadmos, puede ser recibirla u utilizarla con algo.verificaToken

app = express();

app.get('/usuario',verificaToken, function (req, res) {  //Definimos que donde  se llamará, no la estamos ejecutando

  /*Prueba*/

 /*  return res.json(
    {
      usuario: req.usuario,
      nombre: req.usuario.nombre,
      email: req.usuario.email
    }
  ); */

  let desde = req.query.desde || 0; //Tomamos el valor de desde que se manda como parametro adicional en la url con ?desde= si existe o cero
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite= Number(limite); 
  
  let estado= {'estado':'true'};
  Usuario.find(estado, 'nombre email role estado google img') //devuelve todo el registro, se puede filtrar los que estan activos, por google=true, role:'ADMIN_ROLE' etc. El lugando parametro opcional indica que campos quiero que retorne
    .skip(desde)  //Indica desde que resgistro empezar y los demás los salta
    .limit(limite)  //Sirve para el número de registros deseados, podriamos mandar una constante pero estoy recibiendolo como un parametro aadicional. con url?limite=5&otro=algo
    .exec((err,usuarios)=>{
        if (err)
        {
          return res.status(400).json({
            ok:false,
            err
          });
        }

        Usuario.count(estado, (err,conteo)=>{ //Aquí  porque cuando haga la petición, si es correcta se hace el conteo y se retorna toda la infomación. Aquí también se puede mandar una opción del conteo e {}
          res.json({
            ok:true,
            usuarios,//Significa usuarios: usuarios, es decir la propiedad usuario muestra los usuarios recibidos
            registros_totales: conteo
          });
          
        });

      })  //Es como la instrucción ejecutalo
  }); //Fin del get

app.post('/usuario',[verificaToken, verificaAdmin_Role], function (req, res) {
   let body = req.body; //aparece cuando el bodyparse procese las peticiones, funciona para los 4 tipos de petición
   
   /* Creación del esquema*/
   let usuario = new Usuario({
    nombre: body.nombre, //El body es de lo se resibe del usuario y obtenido con body-parser
    email: body.email,
    password: bcrypt.hashSync(body.password,10), //Para quue haga el hash de forma syncrona, que no use callback ni promesass. El primer argumento es el valor a incriptar, el segundo el número de vueltas.
    role: body.role
  });  //Ya funciona como una clase, en el constructor podemos inicializar los parametros

  usuario.save((err,usuarioDB)=>{  //.save guarda en la BD, el callback es para recibir el erro o la ruespuesta si todo ok.
    if(err)
    {
      return res.status(400).json({//El estado de la petición, ver pdf con estados
                            //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
        ok:false,
        err
      });
    }
     // usuarioDB.password=null;

      res.json({ //Si usamos .sen, lo manda como html, con .json lo manda en json
        ok: true,
        usuario : usuarioDB
      });  

  });
      
}); //fin de la función post


  app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) { // Se llama localhost:3000/usuario/id (el valor solamente)
    let id = req.params.id;
      
    let body = _.pick(req.body,['nombre','email','img','role','estado']);
    /*Regresa una copia del objeto con los parametros deseados pasados a traves de una  lista blanca*/
    
    /*Con esto obtenemos el body, obtenemos los parametros que no queremos que se actualicen
    y los eliminamos antes de la llamada para actualizar*/
    //let body = req.body;
    // delete body.password;  //Esta es una manera pero es ineficiente debidoa a que puedo tener muchos campos que no se deben actualizar
    //delete body.google;    //Esta bien para unos cuantos, pero para varios usaremos underscore para filtrar
    

    //usuario.findById(id, (err,usuarioDB)=>{ //.findById viene dek mongoose y es para buscar el usuario aunque despues deberiamos hacer algo como usuarioDB.save
    Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true }, (err,usuarioDB)=>{  //Estew busca por el ID y actualiza si lo encuentra. ver documentación
     //{new} Son opciones de la function y especifica que quiero que devuelva el archivo modificado, de otra forma devuelve el original
      if(err){
        return res.status(400).json(
          {
            ok:false,
            err
          });
      }

      res.json({
        //body,
        ok: true,
        usuario: usuarioDB
       });
    }); //Fin del findByIdAndUpdate
    // res.json( 
    //   {
    //     id  //Esto es unu objeto que se pasará en foprmato json, donde la 
    //   }  //propiedad id, recibe el parametro id. id:id, en ECMAScript 6 se pone solo id
     //   );
    //SI usamos .sen, lo manda como html, con .json lo masnda en json
  
});// fin del put

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {  // /usuario:id significa que es obligatorio pasar la ruta del id y se recoge con req.params.id; sin embargo si no se pone se puede obtener parametros opcionales con ?parametro: valor y se recoge con req.query.nombreDelParametroOpcional
   let id = req.params.id;

/*  Esta permite borrar físicamente el registro
   usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
      
    if(err) //Al parecer al mandar un id inexistende no devuelve erro si no un usuario vacio por lo que agregaremos la comprobacioón si el usuario es null o (!usuario), cuando es null su inverso es convertido en true
      {
         return res.status(400).json(
            { 
              ok: false, 
              err:{message:'Hubo un problema al eliminar, revise que su id sea valido. usuario/idvalido'}
            } );
      }

      if(!usuarioBorrado) //Al parecer al mandar un id inexistende no devuelve erro si no un usuario vacio por lo que agregaremos la comprobacioón si el usuario es null o (!usuario), cuando es null su inverso es convertido en true
      {
          return res.status(400).json(
            { 
              ok: false, 
              err: 
              {message:'Usuario no encontrado'}
            });
      }

      res.json(
        {ok:true,
        usuarioBorrado,
      message: `El usuario ha sido borrado`}
      );  // con . send lo manda html
   }); */
    
   /* Encontramos el registro y le cambiamos el estado*/  
    let cambioEstado = {'estado':'false'};

    Usuario.findByIdAndUpdate( id, cambioEstado, {new: true, runValidators: true} , (err,usuarioBorrado)=>{
      if(err)
      {
        return res.status(400).json(
          {
            ok: false,
            message: 'Error, no se encontró o no se pudo cambiar el estado',
            err
          }
        );
      }

      res.json(
        {
          ok: true,
          usuarioBorrado,
        }
      );
   }); 

  });

  module.exports = app; 
  //exportamos app que contiene todos los servicios