

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());//json请求
router.use(bodyParser.urlencoded({ extended: false }));//表单请求

const db=require('./../db')

let repeat=false
function Result({code=200,msg='',data={}}){
    this.code=code,this.msg=msg,this.data=data
}
function judgeRepeat(next,before){
    before.map((item)=>{
        if(item.type_name==next.type_name&&item.typeId!=next.typeId){
            repeat=true
        }
    })
}
let del_video=`DELETE FROM m_type_video WHERE (videoId=?)`
let update_video=`UPDATE m_type_video SET video_name=?,video_url=?,video_remark=?,video_password=?,typeId=? WHERE (videoId=?)`;
let insert_video=`INSERT INTO m_type_video (video_name,video_url,video_password,video_remark,typeId) VALUES ? `;
let select_video=`SELECT * FROM m_type_video WHERE typeId=?`;
let select_cate_id=`SELECT * FROM m_type_class WHERE typeId=?`;
let select_issue=`SELECT * FROM m_issue WHERE typeId=?`;
let select_answer=`SELECT * FROM m_issue_answer WHERE issueId=?`;


router.get('/getcate',(req,res)=>{
    db.query(select_cate_id,[req.query.typeId],(err,result,d)=>{
        res.json(new Result({data:err}))
    })
})
router.get('/getvideo',(req,res)=>{
    db.query(select_video,[req.query.typeId],(err,result,d)=>{
        res.json(new Result({data:err}))
    })
})
//删除视频
router.get('/delvideo',function (req,res) {
    let item=req.query
    db.query(del_video,[item.videoId],(result)=>{
        res.json(new Result({msg:'删除视频成功'}))
    })
});
//更新视频
router.get('/updatevideo',function (req,res) {
    let item=req.query
    let params=[item.video_name,item.video_url,item.video_remark,item.video_password,item.typeId,item.videoId]
    db.query(update_video,params,(result)=>{
        res.json(new Result({msg:'修改视频成功'}))
    })
});
//获取分类列表
router.get('/getcatelist',function (req,res) {
    let sql=`SELECT * FROM m_type_class`
    db.query(sql,[],(result,fields)=>{
        db.query('SELECT * FROM m_type_video',(err,answer)=>{  //查找视频
            result.map(i=>{
                i.video=[]
                JSON.parse(JSON.stringify(answer)).map(j=>{
                    if(i.typeId==j.typeId){
                        i.video.push(j); 
                    }
                })
            })
            res.json(new Result({data:result}))
        }) 
    })
});
//删除分类
router.get('/delcate',function (req,res) {
    let item=req.query
    let sql=`DELETE FROM m_type_class WHERE (typeId=?)`
    db.query(sql,[item.typeId],(result)=>{
        res.json(new Result({msg:'删除成功'}))
    })
});
//新增分类
router.get('/addcate',function (req,res) {
    let sql='INSERT INTO m_type_class (type_name,coverimg) VALUES (?,?)'
    let item=req.query
    let params=[item.type_name,item.coverimg]
    db.query(`SELECT * FROM m_type_class`,(e,r)=>{
        repeat=false;
        r.map((i)=>{
            if(i.type_name==item.type_name){
                repeat=true
            }
        })
        if(!repeat){
            db.query(sql,params,(result,fields)=>{
                //需要拿到result typeid
                if(item.video){
                    let param_video=[];
                    item.video.map(i=>{
                        i=JSON.parse(i)
                        let pa=[i.video_name,i.video_url,i.video_password,i.video_remark,result.insertId]
                        param_video.push(pa)
                    })
                    db.query(insert_video,[param_video],(answer)=>{})
                }
               
            })
            res.json(new Result({msg:'添加成功'}))
        }else{
            res.json(new Result({msg:'问题类别不可重复'}))
        }
    })
});
//增加视频

//修改分类
router.get('/updatecate',function(req,res){
    let item=req.query
    let coverimg=item.coverimg;
    if(coverimg=='undefined'||coverimg==null){
        db.query(`SELECT coverimg FROM m_type_class WHERE (typeId=?)`,[item.typeId],(w,a)=>{
            coverimg=JSON.parse(JSON.stringify(a))[0].coverimg
        })
    }
    let sql=`UPDATE m_type_class SET type_name=?,coverimg=? WHERE (typeId=?)`;
    let sql_video='';
    let params_video=[];
    let params=[item.type_name,item.coverimg,item.typeId]
    db.query(`SELECT * FROM m_type_class`,[],(e,r)=>{
        repeat=false;
        judgeRepeat(item,r);
        if(!repeat){
            db.query(sql,params,(err,result)=>{
                console.log('需要对视频表进行操作！');
                if(item.video){
                    db.query(select_video,[item.typeId],(anerr,anresult,anfl)=>{
                        let old_video=JSON.parse(JSON.stringify(anerr))
                        let new_video=item.video
                        if(old_video.length==0&&new_video.length!=0){
                            //原本没答案现在增加答案
                            let video_params=[]
                            new_video.map(i=>{
                                i=JSON.parse(i)
                                let pa=[i.video_name,i.video_url,i.video_password,i.video_remark,item.typeId]
                                video_params.push(pa)
                            })
                            db.query(insert_video,[video_params],(answer)=>{})  
                        }else if(old_video.length!=0&&old_video.length<new_video.length){
                            for(let i=0;i<new_video.length;i++){
                                for(let j=0;j<old_video.length;j++){
                                    if(i.videoId==j.videoId){
                                        new_video.splice(i,1)
                                    }
                                }
                            }
                            let video_params=[]
                            new_video.map(i=>{
                                i=JSON.parse(i)
                                let pa=[i.video_name,i.video_url,i.video_password,i.video_remark,item.typeId]
                                video_params.push(pa)
                            })
                            db.query(insert_video,[video_params],(answer)=>{})
                        }
                    }) 
                }
            })
            res.json(new Result({msg:'修改成功'}))
        }else{
            res.json(new Result({msg:'问题类别不可重复'}))
        }
    })
})

module.exports = router;

