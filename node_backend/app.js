const express = require('express'); 
const path = require('path');
const http = require('http');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const db=require('./db');
const fs=require('fs');

const app = express();  
const history = require('connect-history-api-fallback')
app.use(history({
    rewrites: [
      {
        from: /^\/manual\/.*$/,
        to: function(context) {
            return context.parsedUrl.path
        }
      }
    ]
  }))
  //页面刷新

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());//json请求
app.use(bodyParser.urlencoded({ extended: false }));//表单请求
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const issue =require('./router/issue');
const user =require('./router/user');
const cate =require('./router/cate');
app.use(`/manual/issue`,issue);
app.use(`/manual/user`,user);
app.use(`/manual/cate`,cate);

let multer= require('multer');
app.use(multer({dest:'/tem/'}).array('file'))
const qiniu_sdk = require('qiniu')
const bucket='nodeimagetext';
qiniu_sdk.conf.ACCESS_KEY = 'opE9Yp7JSCxitpUhDE8tEg7bAD0cSz0r3PO3JPnr';
qiniu_sdk.conf.SECRET_KEY = 'RaFpD-MDftuYEfRIxwfT0olHmfIr2NcV-tw6fAIt';
const mac = new qiniu_sdk.auth.digest.Mac(qiniu_sdk.conf.ACCESS_KEY, qiniu_sdk.conf.SECRET_KEY);
const config = new qiniu_sdk.conf.Config()
app.post('/file_upload',(req,res)=>{
    let fileuploadpath=__dirname+'/upload_image/'+req.files[0].originalname;
    let filemessage='';
    fs.readFile(req.files[0].path,(err,data)=>{
        fs.writeFile(fileuploadpath,data,(err)=>{
            if(err){
                console.log(err);
            }else{
                filemessage={
                    message:'上传图片成功！',
                    filename:req.files[0].originalname
                }
                let options = {
                    scope: bucket,
                    expires: 3600 * 24,
                    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
                };
                let putPolicy = new qiniu_sdk.rs.PutPolicy(options);
                let uploadToken = putPolicy.uploadToken(mac);
                let localFile = fileuploadpath;
                let formUploader = new qiniu_sdk.form_up.FormUploader(config);
                let putExtra = new qiniu_sdk.form_up.PutExtra();
                let key=req.files[0].originalname;
                // 文件上传
                formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
                respBody, respInfo) {
                if (respErr) {
                    throw respErr;
                }
                if (respInfo.statusCode == 200) {
                    key=respBody.key
                    console.log(respBody);
                    
                } else {
                    console.log(respInfo.statusCode);
                }
                });
                let bucketManager = new qiniu_sdk.rs.BucketManager(mac, config);
                let privateBucketDomain = 'http://qa1z5jgrb.bkt.clouddn.com';//私有空间域名
                let deadline = 2147483647  //永不过期
                let privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain,key, deadline);
                res.json({errno:0,data:[privateDownloadUrl]})  
            }
        })
    })  
   
})

module.exports = app;