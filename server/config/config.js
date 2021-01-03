//Archivo de configuración, puertos, sevillas, tokens


/*PUERTO*/
process.env.PORT= process.env.PORT || 3000;  //En el entorno local el env.PORT no existe por eso usamos el 3000 pero en el servidor(ej, Heroku) si y es el que usamos

//=====================================================================
//ENTORNO
//=====================================================================

process.env.NODE_ENV = (!process.env.NODE_ENV)? 'dev': process.env.NODE_ENV;  //Variabhle que establece heroku y si existe algo es que corre en producción, de lo contrario es desarollo, pudo hacers como el PORT 

//=====================================================================
//FECHA DE VENCIMIENTO
//=====================================================================

//60 seg
//60 min
//24 horas
//30 días

process.env.CADUCIDAD_TOKEN = 60*60*24*30;

//=====================================================================
//SEED DE AUTENTICACIÓN
//=====================================================================

process.env.SEED = process.env.SEED  || 'este-es-el-seed-desarrollo'; //Definiremos el de producción como una variable de entorno
//=====================================================================
//Base de datos
//=====================================================================

if(process.env.NODE_ENV === 'dev') //Para usarlo en la conexión ya sea local o remota
{
    console.log('Estoy en des');
    process.env.URLDB = 'mongodb://localhost:27017/cafe';
}else{
    console.log('Estoy en prod');
    process.env.URLDB = process.env.MONGO_URI;
}



