/*
 关于聊天内容：0代表文字，1代表提示，2代表图片
*/
const express=require('express');
const MongoClient=require('mongodb').MongoClient;
const url="mongodb://lang:lyg12580@localhost:27017/";
// const url="mongodb://localhost:27017/";
const ws = require('ws');
let uuid = require('uuid');
const socketServer = ws.Server;
const wss=new socketServer({port:8090});
var bodyParser = require('body-parser');
var multer = require('multer');
var bson = require('bson');
var app=express(),db,dbo;
app.use(express.static('./files'));
const wsList=[];
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./files");
    },
    filename: function (req, file, callback) {
        const {id,collectionName,width,height,userId}=req.query;
        const fileName=Date.now()+"-"+file.originalname;
        let chatCollection=dbo.collection(collectionName);
        chatCollection.updateOne({_id:new bson.ObjectId(id)},{
            $set:{msg:'files/'+fileName,width,height}
        },()=>{
            freshenById(userId,'freshenHistory');
        })
        callback(null,fileName);
    }
}); 
var upload = multer({ storage: Storage }).single("file"); //Field name and max count
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));
var myLogger=function(req,res,next){
    // console.log('Logged');
    next();
}
app.use(myLogger);
MongoClient.connect(url,{useUnifiedTopology:true},function(err,dbs){
    if(err) throw err;
    db=dbs;
    dbo=db.db("mim");
})

console.log('打开聊天服务器');
//聊天服务器
wss.on('connection',function(ws,req){
    let params =req.url.split('?')[1];
    let uuid=params.split('=')[1];
    let flag=wsList.some(item=>item.uuid==uuid);
    if(flag){
        wsList.forEach(item=>{item.uuid==uuid?item.ws=ws:''})
    }else{
        wsList.push({uuid:uuid,ws});
    }
   
    // var dbo=db.db("mim");
    // var userCollection=dbo.collection("user");
    // userCollection.find({uuid}).toArray((err,result)=>{
    //     if(err) throw err;
    //     if(result.length==1){
    //         userCollection.updateOne({uuid},{$set:{ws}})
    //     }
    // })
    // wsList.forEach(item=>{
    //     item.ws.send(uuid+'上线')
    // })
    ws.on('close', function() {
        console.log('断开连接')
    })
    ws.on('error',(err)=>{
        console.log(err);
    })
})




//登录
app.post('/login',function(req,res){
    const reqData=req.body;
    var userCollection=dbo.collection("user");
    userCollection.find(reqData).toArray((err,result)=>{
        if(err) throw err;
        if(result.length==1){
            let resData=result[0];
            let client_uuid=uuid.v4();
            userCollection.updateOne({name:reqData.name},{$set:{online:true,uuid:client_uuid}});
            res.send({message:'登录成功',success:true,data:{uuid:client_uuid,id:resData._id,name:resData.name,friends:resData.friends,online:true}})
        }else{
            res.send({message:'用户名和密码不正确',success:false})
        }
    })
})
function insertData(dbo,collection,data,user1,user2,res){
    var chatCollection=dbo.collection(collection);
    chatCollection.find({}).toArray((err,result)=>{
        if(err){
            console.log(err)
        }else{
            let now=new Date(),len=result.length-1;
            if(result.length>0&&result[len].date&&now.valueOf()-result[len].date.valueOf()>600000){  //600000
                let newData=JSON.parse(JSON.stringify(data));
                newData.msg=now;
                newData.type='1';
                chatCollection.insertMany([{...newData,date:now},{...data,date:now}],(err,result)=>{
                    if(err){
                        console.log(err)
                    }else{
                        user1&&freshenById(user1,'freshenHistory','freshenFriends');
                        user2&&freshenById(user2,'freshenHistory','freshenFriends');
                        res&&res.send({success:true,message:'写入成功',data:{id:result.ops[1]._id+'',collectionName:collection}})
                    }
                });
            }else{
                chatCollection.insertOne({...data,date:now},(err,result)=>{
                    if(err){
                        console.log(err)
                    }else{
                        user1&&freshenById(user1,'freshenHistory','freshenFriends');
                        user2&&freshenById(user2,'freshenHistory','freshenFriends');
                        res&&res.send({success:true,message:'写入成功',data:{id:result.ops[0]._id+'',collectionName:collection}})
                    }
                });
            }
            
        }
    })
    
}


function updateUnread(user1,user2,response){
    dbo.collection(user1+'').find({friendId:user2}).toArray((err,res)=>{
        if(err){
            console.log(err);
        }else{
            if(res.length>0){
                let unreadNum=res[0].unreadNum+1;
                dbo.collection(user1).updateOne({friendId:user2},{$set:{
                    unreadNum,
                    lastMsg:response.type==='0'||response.type==='1'?response.msg:
                                response.type==='2'?'[图片]':'[文件]'
                }});
            }
        }
    })
}

//发送消息
app.post('/sendMsg',function(req,res){
    const reqData=req.body;
    const {sendUser,acceptUser}=reqData;
    let collectionName=sendUser<acceptUser?sendUser+'_'+acceptUser:acceptUser+'_'+sendUser;
    updateUnread(sendUser,acceptUser,reqData);
    updateUnread(acceptUser,sendUser,reqData);
    insertData(dbo,collectionName,reqData,sendUser,acceptUser,res);
})

//查找好友
app.get('/getFriends',function(req,res){
    const reqData=req.query;
    var userCollection=dbo.collection("user");
    userCollection.find({name:{$regex:reqData.name?reqData.name:''}}).toArray(function(err,result){
        if(err) throw err;
        let array=[];
        result.forEach(element => {
            array.push({id:element._id,name:element.name})
        });
        if(reqData.name===''){
            res.send({success:true,data:[]})
        }else{
            res.send({success:true,data:array})
        }
    })
})


//发送好友邀请
app.post('/addFriend',function(req,res){
    const reqData=req.body;
    var applicationsCollection=dbo.collection("applications");
    applicationsCollection.find({...reqData}).toArray((err,result)=>{
        if(err) console.log(err);
        if(result.length>0){
            res.send({message:'好友申请已提交，请耐心等候',success:false})
        }else{
            applicationsCollection.insertOne({...reqData,isRead:false});
            freshenById(new bson.ObjectId(reqData.friendId),'freshenInvitation');
            res.send({message:"好友申请已提交",success:true});
        }
    })
})
let count=0;
function freshenById(id,type,type2){
    var userCollection=dbo.collection("user");
    if(typeof id=='string'){
        id=new bson.ObjectId(id);
    }
    userCollection.find({_id:id}).toArray((err,result)=>{
        if(err){
            console.log(err)
        }else{
            const uuid=result[0].uuid;
            count++;
            wsList.forEach(item=>{
                if(item.uuid==uuid){
                    item.ws.send(type);
                    if(type2){
                        item.ws.send(type2);
                    }
                }
            })
        }
    })
}


//获取我的好友列表
app.get('/getMyFriends',function(req,res){
    const reqData=req.query;
    var userCollection=dbo.collection("user");
    userCollection.find({uuid:reqData.uuid}).toArray(function(err,result){
        if(err) console.log(err);
        var friendsCollection=dbo.collection(result[0]._id+'');
        friendsCollection.find({}).toArray((err,result)=>{
            if(err) {
                res.send({success:true,data:{friends:[]}});
            }else{
                res.send({success:true,data:{friends:result}});
            }
        })
    })
})


//注册
app.post('/register',function(req,res){
    const reqData=req.body;
    var userCollection=dbo.collection("user");
    userCollection.find({name:reqData.name}).toArray(function(err,result){
        if(err) throw err;
        if(result.length>0){
            res.send({message:'账号已被注册',success:false});
        }else{
            userCollection.insertOne({...reqData,online:false,uuid:null},function(err,result){
                if(err) throw err;
                let collectionName=result.insertedId+'';
                dbo.createCollection(collectionName,(err,result)=>{
                    if(err) throw err;
                });
                res.send({success:true,message:'注册成功'});
            })
        }
    })
})

//获取好友邀请
app.get('/getFriendInvitation',(req,res)=>{
    const reqData=req.query;
    var userCollection=dbo.collection("user");
    var applicationsCollection=dbo.collection("applications");
    userCollection.find({uuid:reqData.uuid}).toArray((err,user)=>{
        const id=user[0]._id+'';
        applicationsCollection.find({friendId:id}).toArray(function(err,result){
            if(err) throw err;
            res.send({success:true,data:result});
            applicationsCollection.updateMany({friendId:id,isRead:false},{$set:{isRead:true}})
        })
    })
})


//接受好友邀请
app.post('/acceptFriend',(req,res)=>{
    const reqData=req.body;
    var userCollection=dbo.collection("user");
    var applicationsCollection=dbo.collection("applications");
    var ishad=false;
    const id=new bson.ObjectId(reqData._id);
    userCollection.find({uuid:reqData.uuid}).toArray(function(err,result){
        if(err) console.log(err);
        var friendsCollection=dbo.collection(result[0]._id+'');
        const mine={id:result[0]._id+'',name:result[0].name};
        console.log(mine);
        friendsCollection.find({}).toArray((err,result)=>{
            if(err) {
                res.send({success:true,message:'添加好友失败'});
            }else{
                result.forEach(item=>{
                    if(item.friendId==reqData.friendId){
                        ishad=true;
                    }
                })
                if(ishad){
                    applicationsCollection.deleteOne({_id:id},(err,result)=>{});
                }else{
                    applicationsCollection.deleteOne({_id:id},(err,result)=>{});
                    friendsCollection.insertOne({friendId:reqData.friendId,name:reqData.name,unreadNum:1,lastMsg:'我们已经是好友了，开始聊天吧'});
                    dbo.collection(reqData.friendId).insertOne({friendId:mine.id,name:mine.name,unreadNum:1,lastMsg:'我们已经是好友了，开始聊天吧'});
                    let collectionName=mine.id<reqData.friendId?mine.id+'_'+reqData.friendId:reqData.friendId+'_'+mine.id;
                    dbo.createCollection(collectionName,(err,result)=>{
                        if(err) throw err;
                        const param1={
                            sendUser:mine.id,
                            acceptUser:reqData.friendId,
                            msg:'我们已经是好友了，开始聊天吧',
                            type:'1'
                        }
                        insertData(dbo,collectionName,param1);
                    })
                }
                res.send({success:true,message:'添加好友成功'});
            }
        })
    })
})

//绝拒好友邀请
app.post('/refuseFriend',(req,res)=>{
    const reqData=req.body;
    const id=new bson.ObjectId(reqData._id);
    var applicationsCollection=dbo.collection("applications");
    applicationsCollection.deleteOne({_id:id},(err,result)=>{
        if(err){
            res.send({success:false,message:'请求错误'});
        }else{
            res.send({success:true,message:'已拒绝'});
        }
    });
})

//获取聊天记录
app.post('/getChatHistory',(req,res)=>{
    const reqData=req.body;
    var userCollection=dbo.collection("user");
    userCollection.find({uuid:reqData.uuid}).toArray(function(err,result){
        if(err){
            console.log(err);
        }else{
            const userId=result[0]._id+'';
            let collectionName=userId<reqData.friendId?userId+'_'+reqData.friendId:reqData.friendId+'_'+userId;
            
            dbo.collection(collectionName).find({}).toArray((err,result)=>{
                dbo.collection(userId).updateOne({friendId:reqData.friendId},{$set:{unreadNum:0}},()=>{
                    freshenById(userId,'freshenFriends');
                    freshenById(reqData.friendId,'freshenFriends');
                });
                res.send({success:true,data:result})
            })
        }
    })
})

app.post("/upload", function (req, res) {
    upload(req, res, function (err) {        
        if (err) {       
            console.log(err)
            console.log('上传失败')
            res.send({success:false,message:'上传失败'}) ;  
            return res.end("Something went wrong!");
        }
        console.log('上传成功')
        res.send({success:true,message:'上传成功'}) ; 
        return res.end("File uploaded sucessfully!.");
    });
});


app.listen(3000)