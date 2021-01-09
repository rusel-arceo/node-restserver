//============================================
//  Verificar Token
//===========================================
const jwt = require('jsonwebtoken');  //para usar la función que compara el token

let verificaToken = ( req, res, next) =>{
    let token = req.get('token'); //Obtengo el token desde la petición get, token es el nombre del parametro

    //Verificando que el token sea valido
    jwt.verify (token, process.env.SEED, (err,decoded)=>{
        if(err){
            return res.status(401).json(
                {
                    ok:false,
                    err: {
                        message:"Token no valido"
                    }
                });
        }
        req.usuario = decoded.usuario; //El decoded son los valores del token, ya desifrados. decoded.usuario es el payload
        //console.log(decoded.usuario);
        next();  //dentro del verify para que verifique que la semilla sea correcta
    }) //fin del verify 

    /* res.json({
        token
    });*/
}

//============================================
//  Verificar ROLE ADMIN
//===========================================

let verificaAdmin_Role = (req, res, next) =>
{
    let usuario = req.usuario;
    if(usuario.role !='ADMIN_ROLE')
    {
        res.json(
            {
                ok: false,
                err:{
                    message:'El usuario no tiene provilegios para esta acción'
                }
            }); 
    }else
    {
        next();
    }
}

module.exports = {
    verificaToken,
    verificaAdmin_Role
}