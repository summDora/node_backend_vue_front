const mysql = require('mysql');
module.exports={
    connection:mysql.createConnection({
        host:'192.168.199.89',
        user:'root',
        password:'suipao888',
        database:'movevi-manual',
        port:3306
    }),
    errInfo:(err)=>{
        if(err){
            console.log('[SELECT ERROR]:',err.message);
          }
    },
 }