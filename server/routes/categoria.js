const express= require ('express');

let {verificaToken, verificaAdmin_Role} = require ('../middlewares/autenticacion');

let app = express();
let Categoria = require ('../models/categoria');

let _ = require ('underscore');

/*Implemnentando el get*/
app.get('/categoria', verificaToken, (req,res) => {
    
    Categoria.find({}) //puedes ser .find({}, (err,categoriasDB)) pero no se podrian agregar otros funciones estras
    .populate('usuario', 'nombre email')  //Si hay otros id de otras tablas, solo se pone de nuevo el populate
    .sort('descripcion')       //Ordena las categorias alfabeticamente por descripcion
    .exec((err, categoriaDB) => 
    {
        if(err)
        {
            return res.status(500).json({
                ok:false,
                err:
                {message: 'Hubo un error al realizar la busqueda'}
            });
        }
    
        res.json({
            ok:true,
            categoria: categoriaDB
        });
    }); 
});

/*Implemnentando el get/:id para obtener una sola categoria*/

app.get('/categoria/:id',verificaToken,(req,res) => {

    let id = req.params.id;  //El parametro que se define con /: se recibe con req.params.id

    Categoria.findById(id,(err,categoriaDB)=>{
        
        if(err)
        {
            return res.status(400).json({
                ok:false,
                err:
                {
                    message: 'Ha sucedido un error al intentar hacer la busqueda'
                }
            });
        }

        if(!categoriaDB)  //Si no se encontro se guardó la categoría
        {
            return res.status(400).json({//El estado de la petición, no se creo la categoria, ver pdf con estados
            //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err:{
                message: 'El id no fue encontrado'
            }
            });
        }
    
        res.json({
            ok:true,
            categoria: categoriaDB
        });
    });

});
 

/*CREANDO EL POST. crea una categoria*/
app.post('/categoria',[verificaToken, verificaAdmin_Role], (req,res) => {
    
   let id = req.usuario._id  //El parametro _id se  crea automaticamente

   let categoria = new Categoria ({
       descripcion: req.body.descripcion,
       usuario: id
   });

   categoria.save((err, categoriaDB)=>{
   
    if(err)
    {
      return res.status(500).json({//Error en la Base de datos, ver pdf con estados
                            //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
        ok:false,
        err
      });
    }

    if(!categoriaDB)  //Si no se encontro se guardó la categoría
    {
      return res.status(400).json({//El estado de la petición, no se creo la categoria, ver pdf con estados
                            //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
        ok:false,
        err
      });
    }
   
    res.json({ //Si usamos .sen, lo manda como html, con .json lo manda en json
        ok: true,
        categoria: categoriaDB
      });  

   }); //final del save

});

app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req,res)=>{
    let id =  req.params.id; //Es id, porque asi lo definimos en la ruta
    let body = _.pick(req.body,['descripcion']);  //.pick, devuelve los elementos del arreglo que se pasan coomo parametro.  Su puso haber creado let decCategoria = {desc: body.descipcion} pero esta forma funciona bien
    body.usuario = req.usuario._id;

    console.log(id);
    
    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true},(err, categoriaDB)=>{
        if(err)
        {
            return res.status(400).json({//El estado de la petición, ver pdf con estados
                           //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err
            });
        }

      if(categoriaDB)
      {
        respuesta = { //Si usamos .sen, lo manda como html, con .json lo manda en json
            ok: true,
            categoria: categoriaDB
          };
      }  else{
        respuesta = { //Si usamos .sen, lo manda como html, con .json lo manda en json
            ok: false,
            message: 'No se encontró la categoria',
            categoria: categoriaDB            
          };
      }
      res.json(respuesta);  

    });  //fin del update
});  //Fin del put

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req,res)=>{
    let id = req.params.id;  //Porque se recibe de la ur    
    let respuesta='';

    console.log(id);

    Categoria.findByIdAndRemove( id, (err, categoriaDB)=>{

        console.log(categoriaDB);

        if(err)
        {
            return res.status(400).json({//El estado de la petición, ver pdf con estados
                           //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err:{
                message: 'Ha sucedido un error al buscar el catalogo en la BD, intente más tarde o comuniquese con si lider informatico'
            }
            });
        }

        if(!categoriaDB)
        {
            return res.status(400).json({//El estado de la petición, ver pdf con estados
                //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err:{
                message: 'Ha sucedido un error al buscar el catalogo en la BD, probablemente no existe en la BD, intente más tarde o comuniquese con soporte de sitemas' }
             })
       }else{
            return res.json(
            {
                ok:true,
                message: 'Categoría eliminada',
                categoria: categoriaDB                
            });
       }

       return respuesta;
    });
});
//Crear 5 categorias
//En app.get ('/categoría') muestra todas las categorias
//En app.get ('/categoría/:id') muestra una categoria del id
//app.post crear una nueva categoría. en id del usuario se encuentra en req.usuario_id que regresa de verificaToken
//put. actualiza la categoria, el nombre y descripción
//delete. Recibe el id de la categoría, esto solo lo puede ser un administrador y debe solicitar el token 

module.exports = app;