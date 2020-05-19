
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());//json请求
router.use(bodyParser.urlencoded({ extended: false }));//表单请求
const db=require('./../db')
function Result({code=200,msg='',data={}}){
  this.code=code
  this.msg=msg
  this.data=data
}
let sql=`SELECT * FROM user WHERE userName=?`
let select_user=`SELECT * FROM user`
router.get('/login',(req,res)=>{
  db.query(sql,[req.query.username],(result,err,fields)=>{
      let message=result[0]
      if(message != null || message != undefined){
        if(message.password ==req.query.password){
          res.json(new Result({msg:'登录成功',data:message}))
        }else{
          res.json(new Result({msg:'密码错误'}))
        }
      }else{
        res.json(new Result({msg:'暂无用户，请注册！'}))
      }
  })
})
//获取管理员列表
router.get('/getuserlist',(req,res)=>{
  db.query(select_user,(err,result)=>{
    res.json(new Result({data:result}))
  })
})
module.exports = router;
