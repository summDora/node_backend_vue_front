
const express = require('express');
const router = express.Router();
const db=require('./../db')

function Result({code=1,msg='',data={}}){
    this.code=code
    this.msg=msg
    this.data=data
}
let repeat=false
function judgeRepeat(next,before){
    before.map((item)=>{
        if(item.is_title==next.is_title&&item.issueId!=next.issueId){
            repeat=true
        }
    })
}

let select_issue_list=`SELECT * FROM m_issue WHERE typeId=?`
let insert_issue=`INSERT INTO m_issue (is_title, content,typeId, userId, userName) VALUES (?,?,?,?,?)`
let del_issue=`DELETE FROM m_issue WHERE issueId=?`
let select_issue=`SELECT * FROM m_issue`
let update_issue=`UPDATE m_issue SET is_title=?,content=?,typeId=?,userId=?,userName=? WHERE (issueId=?)`
let select_username=`SELECT userName FROM user WHERE userId=?`
let select_answer=`SELECT * FROM m_issue_answer `
let insert_answer=`INSERT INTO m_issue_answer (issueId, reason, answer) VALUES ?`
let select_issue_answer=`SELECT * FROM m_issue_answer WHERE issueId=?`
let update_answer=`UPDATE m_issue_answer SET reason=?,answer=?,issueId=? WHERE (answerId=?)`
let del_answer=`DELETE FROM m_issue_answer WHERE answerId=?`
//删除答案
router.get('/delanswer',(req,res)=>{
    db.query(del_answer,[ [ req.query.answerId]],( result)=>{
        res.json(new Result({msg:'删除成功'}))
    })
})
//更改答案
router.get('/updateanswer',(req,res)=>{
    db.query(update_answer,[ req.query.reason,req.query.answer,req.query.issueId,req.query.answerId],( result)=>{
        res.json(new Result({msg:'更改成功'}))
    })
})
//获取分类下的问题汇总
router.get('/getissuelist',(req,res)=>{
    let item=req.query
    if( item.typeId){
        db.query(select_issue_list,[ item.typeId],(result)=>{
            result=JSON.parse(JSON.stringify(result))
            if(result.length>0){
               db.query(select_answer,(err,answer)=>{
                    result.map(i=>{
                        i.answer=[]
                        JSON.parse(JSON.stringify(answer)).map(j=>{
                            if(i.issueId==j.issueId){
                                i.answer.push(j); 
                            }
                        })
                    })
                    res.json(new Result({data:result}))
               })
            }else{
                res.json(new Result({msg:'该分类下暂无问题'}))
            }
        })
    }else{
        res.json(new Result({msg:'请先选择问题类别！'}))
    }
});
//添加新问题
router.get('/addissue',(req,res)=>{
    let item=req.query
    let params=[item.is_title,item.content,Number(item.typeId) ,Number(item.userId) , item.userName]
    db.query(select_username,[item.userId],(w,a,f)=>{
        let name=JSON.parse(JSON.stringify(w))[0].userName
        if(name!= item.userName){
            res.json(new Result({msg:'账号异常，请重新登录！'}))
        }else{
            db.query(select_issue,(e,r)=>{
                repeat=false;
                judgeRepeat(item,r)
                if(!repeat){
                    db.query(insert_issue,params,(err,result)=>{
                        console.log(err,result);
                    })
                    res.json(new Result({msg:'添加成功'}))
                }else{
                    res.json(new Result({msg:'请勿重复添加问题！'}))
                }
            })
        }
    })
});
//修改问题
router.get('/updateissue',(req,res)=>{
    let item=req.query
    let params=[item.is_title,item.content,item.typeId,item.userId,item.userName,item.issueId]
    db.query(select_username,[item.userId],(w,a,f)=>{
        let name=JSON.parse(JSON.stringify(w))[0].userName
        if(name!=item.userName){
            res.json(new Result({msg:'账号异常，请重新登录！'}))
        }else{
            db.query(select_issue,(e,r)=>{
                repeat=false;
                judgeRepeat(item,r)
                if(!repeat){
                    db.query(update_issue,params,(err, result)=>{
                        console.log('需要对答案表进行操作！');
                    })

                    res.json(new Result({msg:'修改成功'}))
                    
                }else{
                    res.json(new Result({msg:'该问题已存在！'}))
                }
            })
        }
    }) 
})
//删除问题
router.get('/delissue',(req,res)=>{
    db.query(del_issue,[ req.query.issueId],( result)=>{
        res.json(new Result({msg:'删除成功'}))
    })
});

//七牛云上传图片
const qiniu_sdk = require('qiniu')
const bucket='nodeimagetext';
qiniu_sdk.conf.ACCESS_KEY = 'opE9Yp7JSCxitpUhDE8tEg7bAD0cSz0r3PO3JPnr';
qiniu_sdk.conf.SECRET_KEY = 'RaFpD-MDftuYEfRIxwfT0olHmfIr2NcV-tw6fAIt';
const mac = new qiniu_sdk.auth.digest.Mac(qiniu_sdk.conf.ACCESS_KEY, qiniu_sdk.conf.SECRET_KEY);
const config = new qiniu_sdk.conf.Config()

router.get('/gettoken',(req,res)=>{
    let options = {
            scope: bucket,
            expires: 3600 * 24
        };
    let putPolicy = new qiniu_sdk.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(mac);
    res.json(new Result({data:uploadToken})) 
}) 
router.get('/getimgurl',(req,res)=>{
    var bucketManager = new qiniu_sdk.rs.BucketManager(mac, config);
    var privateBucketDomain = 'http://qa1z5jgrb.bkt.clouddn.com';//私有空间域名
    var deadline = 2147483647  //永不过期
    var privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, req.query.key, deadline);
    res.json(new Result({data:privateDownloadUrl})) 
}) 
module.exports = router;