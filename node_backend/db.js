var mysql = require('mysql');
var dbConfig = require('./db.config');
module.exports={
    query:function(sql,params,callback){
        //每次使用的时候需要创建链接，数据操作完成之后要关闭连接
        let conn=mysql.createConnection(dbConfig);
        conn.connect((err)=>{
            if(err){
                console.log('数据库连接失败');
                return
            }
        })
         //开始数据操作
        conn.query(sql,params,(err,results,fields)=>{
            if(err){
                console.log(err);
                console.log('数据操作失败');
                return
            }
            callback (results,fields);
            //停止链接数据库，必须再查询语句后，要不然一调用这个方法，就直接停止链接，数据操作就会失败
            conn.end(function(err){
                if(err){
                    console.log('关闭数据库连接失败！');
                    return
                }
            })

        })
    }
}
