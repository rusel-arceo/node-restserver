const express = require ('express');
const {verificaToken} = require ('../middlewares/autenticacion');

let Producto = require('../models/producto');
const _ = require ('underscore');

let app = express();

/*Buscar Productos*/

app.get ('/producto/buscar/:termino',verificaToken, (req, res)=>{
    
    let termino = req.params.termino;
    let regexp = new RegExp(termino, 'i'); // Crea una expresion regular, usando el termio, la i es para que no tome en curnta las mayusculas y minusculas

     Producto.find({nombre: regexp})
    .populate('categoria', 'descripcion')
    .exec((err, productoDB)=>{
        
        if(err)
        {
            return res.status(500).json({
                ok: false,
                err:{
                    message: "Ha sucedido un error en la BD al buscar el producto"
                } 
            });
        }

        res.json({
                ok: true,
                producto: productoDB,
        });
    });
     
});


/*IMPLEMENTANDO EL SERVICIO GET: BORRAR PRODUCTO */
app.get('/producto', verificaToken, (req,res) =>{
    let desde = req.query.desde || 0;  //SON  pasados como parametros adicioneales con ?param=valor&parama2=valor2
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    
    let estado= req.query.estado || true;
    console.log(estado);
         //estado= Boolean (estado);

    console.log(estado);
    estado = {disponible: estado}
    console.log(estado);
    console.log(desde, limite);
        
     Producto.find(estado)  //Ue busque solo los que cumplan con la condición
    .skip(desde)
    .limit(limite)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .sort('nombre')
    .exec((err, productoDB)=>{
        if(err)
        {
            return res.status(500).json({
                ok: false,
                err:{
                    message: "Ha sucedido un error en la BD al buscar las categorias"
                } 
            });
        }

        Producto.countDocuments(estado,(err, conteo)=>{
            if(err)
             {
                return res.status(500).json({
                    ok: false,
                    err:{
                        message: "Ha sucedido un error en la BD al buscar las categorias"
                    } 
                });
            }
            res.json({
                ok: true,
                producto: productoDB,
                conteo
            });
        });
        
    });
});

/*IMPLEMENTANDO EL SERVICIO GET/producto/:id    BORRAR PRODUCTO */
app.get('/producto/:id', verificaToken, (req,res) =>{
    
    let id = req.params.id;

    Producto.findById(id)  //Si necesito mandar parametro, lo puede hacer al definir la función y se recibe los resultados y se implementa en el exec
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    //.sort('nombre')
    .exec((err, productoDB)=>{
        if(err)
        {
            return res.status(500).json({
                ok: false,
                err:{
                    message: "Ha sucedido un error en la BD al buscar las categorias"
                } 
            });
        }

        if(!productoDB)
        {
            return res.status(500).json({
                ok: false,
                err:{
                    message: "Producto NO encontrado"
                } 
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/* IMPLEMENTACION DEL POST: CREAR USUARIO */
app.post('/producto',verificaToken, (req, res)=>{
    let id = req.usuario._id;

    let producto = new Producto ({
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion:req.body.descripcion,
        disponible:req.body.disponible,
        categoria:req.body.categoria,
        usuario: id
    });

    producto.save((err, productoDB) => {
        if(err)
        {
            return res.status(500).json({
                ok: false,
                err:{
                    message:'Tenemos un error al intertar guardar el producto'
                }
            });
        }
        
        res.status(201).json({   //Se suele usar cuando se crea un nuevo producto
            ok:true,
            producto: productoDB
        });
    });
    
});

app.put('/producto/:id',verificaToken, (req, res)=>{
    let id = req.params.id;

    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoDB)=>{
        /*Otra opción es usar Producto.findById (id, (err, productoDB)=>{
            hacer validaciones y si todo bien entonces hacer 
        ProductoDB.nombre: body.nombre, ProductoDB.precioUni: body.precioUni,ProductoDB.disponible: body.disponible, ProductoDB.categoria: body.categoria 
        ProductoDB.save((err, ProdGUardado))=>{Validaciones y respuestas});
        }); */
        
        if(err)
        {
            return res.status(400).json({//El estado de la petición, ver pdf con estados
                           //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err
            });
        }

      if(productoDB)
      {
        respuesta = { //Si usamos .sen, lo manda como html, con .json lo manda en json
            ok: true,
            producto: productoDB
          };
      }  else{
        respuesta = { //Si usamos .sen, lo manda como html, con .json lo manda en json
            ok: false,
            message: 'No se encontró la categoria',
            producto: productoDB            
          };
      }
      res.json(respuesta);   
    });
    
});

app.delete('/producto/:id',verificaToken, (req,res)=>{
    let id = req.params.id;  //Porque se recibe de la ur    
    let respuesta='';

    console.log(id);

    Producto.findByIdAndUpdate( id, {disponible: false}, {new: true, userFindAndModify:true}, (err, productoDB)=>{

        console.log(productoDB);

        if(err)
        {
            return res.status(400).json({//El estado de la petición, ver pdf con estados
                           //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err:{
                message: 'Ha sucedido un error al buscar el producto en la BD, intente más tarde o comuniquese con su lider informatico'
            }
            });
        }

        if(!productoDB)
        {
            return res.status(400).json({//El estado de la petición, ver pdf con estados
                //Se puede usar .json() vacio pero es recomendable mandar información adicionalñ
            ok:false,
            err:{
                message: 'Ha sucedido un error al buscar el producto en la BD, probablemente no existe en la BD, intente más tarde o comuniquese con soporte de sitemas' }
             })
       }else{
            return res.json(
            {
                ok:true,
                message: 'producto eliminado',
                producto: productoDB                
            });
       }

       return respuesta;
    });
});

module.exports = app; 