<style scoped>
   @import './cate.scss';
</style>
<template>
    <div class="cate">
        <Table  :columns="columns" :data="data" style="flex:1;min-width:650px;max-width:1100px">
            <template slot-scope="{ row }" slot="name">
                <strong>{{ row.name }}</strong>
            </template>
            <template slot-scope="{ row }" slot="action">
                <Button type="warning" size="small" style="margin-right: 5px" @click="show(row)">修改</Button>
                <Button type="error" size="small" @click="remove(row)">删除</Button>
            </template>
        </Table>
        <div class="option">
            <div class="part">
                <p class="title">{{optiontitle}}</p>
                <Form :model="formItem" ref="formValidate" :label-width="80" style="width:70%;min-width:330px">
                    <FormItem label="问题类别">
                        <Input v-model="formItem.type_name" placeholder="请输入新的问题类别"></Input>
                    </FormItem>
                    <FormItem label="设备部件图" prop="">
                        <!-- 
                            
                            action="http://upload-z2.qiniup.com"
                            action="http://192.168.199.111:3000/manual/issue/getqiniu"
                            :on-success="handleSuccess"
                             -->
                        <Upload
                            type="drag"
                            :before-upload="beforeUpload"
                            :data='uploadParams'
                            :on-success="handleSuccess"
                            action="http://upload-z2.qiniup.com"
                            >
                            <div style="padding: 20px 0">
                                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                <p>Click or drag files here to upload</p>
                            </div>
                        </Upload>
                    </FormItem>
                        <FormItem  
                        v-for="(item, index) in video"
                                :key="index"
                                label="视频"
                                >
                            <Row class='video'>
                                <Col span="24">
                                    <Input type="text" v-model="item.video_name" placeholder="请输入视频名称"></Input>
                                </Col>
                                <Col span="24">
                                    <Input type="text" v-model="item.video_url" placeholder="请输入视频地址"></Input>
                                </Col>
                                <Col span="24">
                                    <Input type="text" v-model="item.video_remark" placeholder="请输入视频备注"></Input>
                                </Col>
                                <Col span="24" style="marginRight:8px">
                                    <Input type="text" v-model="item.video_password" placeholder="请输入视频密码"></Input>
                                </Col>
                                <Col span="24">
                                    <Button style="marginRight:20px" @click="handleRemove(index)">Delete</Button>
                                    <Button v-if="optiontitle=='修改问题类别'" type="warning" @click="updatean(index)">修改</Button>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem>
                            <Row>
                                <Col span="12">
                                    <Button type="dashed" long @click="handleAdd" icon="md-add">添加新视频</Button>
                                </Col>
                            </Row>
                        </FormItem>
                    <FormItem>
                        <Button v-if="!isupdate" type="primary" @click="add">添加</Button>
                        <Button v-if="isupdate" type="warning" @click="update">修改</Button>
                        <Button v-if="!isupdate" style="margin-left: 8px" type="primary" ghost @click="cancel">取消</Button>
                        <Button v-if="isupdate"  icon="ios-arrow-back" type="primary" @click="cancel"  style="margin-left: 8px" shape='circle' >返回添加</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
        <Modal v-model="comfirmmodal" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle-outline" style="size:30;marginRight:10px;verticalAlign: baseline"/>
                <span>Delete confirmation</span>
            </p>
            <div style="text-align:center">
                <p>此分类删除后，该分类下所有问题将全部删除</p>
                <p>是否继续删除？</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long @click="del">Delete</Button>
            </div>
        </Modal>
        <Modal v-model="delvideomodal" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle-outline" style="size:30;marginRight:10px;verticalAlign: baseline"/>
                <span>Delete confirmation</span>
            </p>
            <div style="text-align:center">
                <p>该操作不可恢复</p>
                <p>是否继续删除？</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long @click="delvideo">删除</Button>
            </div>
        </Modal>
        <Modal v-model="upvideomodal" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle-outline" style="size:30;marginRight:10px;verticalAlign: baseline"/>
                <span>Delete confirmation</span>
            </p>
            <div style="text-align:center">
                <p>该操作不可恢复</p>
                <p>是否继续修改？</p>
            </div>
            <div slot="footer">
                <Button type="warning" size="large" long @click="updatevideo">修改</Button>
            </div>
        </Modal>
        <expand-row v-if='hide'></expand-row>
    </div>
</template>
<script>
    import expandRow from './../components/expandRow.vue';
    export default {
        components: { expandRow },
        data () {
            return {
                hide:false,
                comfirmmodal:false,
                delvideomodal:false,
                upvideomodal:false,
                delvideoid:null,
                updatevideodata:null,
                optiontitle:'新增问题类别',
                isupdate:false,
                delid:null,
                updateid:null,
                video_length:null,
                uploadParams:{
                    key:'',
                },
                columns: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h(expandRow, {
                                props: {
                                    row: params.row
                                }
                            })
                        }
                    },
                   {
                        type: 'index',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '问题类别',
                        key: 'type_name',
                    },
                    {
                        title: '问题数量',
                        key: 'issue_count'
                    },
                    {
                        title: 'Action',
                        slot: 'action',
                        align: 'center'
                    }
                ],
                data: [],
                coverimg:null,
                index:1,
                video:[],
                formItem: {
                    type_name: '',
                },
                startupdate:false,
                buffer:{},
                video_old:null,
                video_dele_id:[],
            }
        },

        created() {
            this.getcatelist();
            this.gettoken();
        },
        methods: {
            success (msg) {
                this.$Message.success(msg);
            },
            error(msg) {
                this.$Message.error(msg);
            },
            getcatelist(){
                this.$axios({
                    url:'/cate/getcatelist',
                    methods:'get',
                }).then(res => {
                    let data=res.data.data
                    this.data=data
                    let index=0
                    if(this.data.video){
                        this.data.video.map(item=>{
                            item.status=1;
                            index++
                            item.index=index
                        })
                    }
                })
            },
            show(item){
                this.handleReset('formValidate');
                this.coverimg=item.coverimg;
                this.buffer=item;
                this.optiontitle='修改问题类别'
                this.isupdate=true
                this.updateid=item.typeId
                this.formItem.type_name=item.type_name
                this.video=item.video
                this.video_length=item.video.length
                let index=0
                this.video.map(i=>{
                    i.status=1;
                    index++;
                    i.index=index
                })
                console.log(this.video);  
            },
            remove(item){
                this.comfirmmodal=true;
                this.delid=item.typeId
            },
            del(){
                this.$axios({
                    url:'/cate/delcate',
                    methods:'get',
                    params:{
                        typeId:this.delid
                    }
                }).then(res => {
                    if(res.data.code==200){
                        this.success(res.data.msg)
                        this.getcatelist()
                        this.delid=null;
                        this.comfirmmodal=false;
                    }
                })
            },
            add(){
                console.log(this.video)
                let add_params={
                    type_name:this.formItem.type_name,
                    coverimg:this.coverimg,
                    video:this.video,
                }
                //  
                console.log(add_params)
                this.$axios({
                    url:'/cate/addcate',
                    methods:'post',
                    params:add_params
                }).then(res => {
                    if(res.data.msg=='添加成功'){
                        this.success(res.data.msg)
                        this.getcatelist()
                        this.formItem.type_name='';
                        this.handleReset('formValidate');
                        this.index=1
                        this.video=[];
                    }else{
                        this.error(res.data.msg)
                    }
                })    
            },
            updateapi(){
                let update_params={
                    type_name:this.formItem.type_name,
                    coverimg:this.coverimg,
                    video:this.video,
                    typeId:this.updateid,
                    video_dele_id:this.video_dele_id
                }
                console.log(this.video_dele_id);
                this.$axios({
                    url:'/cate/updatecate',
                    methods:'get',
                    params:update_params
                }).then(res => {
                    if(res.data.msg=='修改成功'){
                        this.success(res.data.msg)
                        this.getcatelist()
                        this.video_dele_id=[];
                        this.cancel()
                    }else{
                        this.error(res.data.msg)
                    }
                })
            },
            update(){
                if(this.formItem.type_name==''||this.formItem.type_name == null && this.formItem.type_name == undefined && this.formItem.type_name.length<1){
                    this.error('问题类别名称不可为空')
                }else{
                    this.updateapi()
                }
            },
            //获取七牛云token
            gettoken(){
                this.$axios({
                    url:'/issue/gettoken',
                    methods:'get',
                }).then(res => {
                    this.uploadParams.token=res.data.data
                })
            },
            beforeUpload (request) {
                this.uploadParams.key = request.name
                console.log(this.uploadParams);
                
            },
            //上传成功从后台拿url
            handleSuccess () {
                this.$axios({
                    url:'/issue/getimgurl',
                    methods:'get',
                    params:{
                        key:this.uploadParams.key
                    }
                }).then(res => {
                    this.coverimg=res.data.data
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            cancel(){
                this.optiontitle='新增问题类别';
                this.isupdate=false;
                this.handleReset('formValidate');
                this.formItem.type_name='';
                this.coverimg=null;
                this.video=[];
            },
            //操作视频item
            handleAdd () {
                this.video.push({
                    value: '',
                    status: 1
                });
            },
            handleRemove (index) {
                if(this.optiontitle=='修改问题类别'){
                    console.log(this.video[index]);
                    this.delvideoid=this.video[index].videoId
                    this.delvideomodal=true
                }else{
                    this.video.splice(index,1)
                }
            },
            delvideo(){
                this.$axios({
                    url:'/cate/delvideo',
                    methods:'get',
                    params:{
                        videoId:this.delvideoid
                    }
                }).then(res => {
                    if(res.data.code==200){
                        this.success(res.data.msg)
                        this.getcatelist()
                        this.delvideoid=null;
                        this.delvideomodal=false;
                        this.cancel()
                    }
                })

            },
            updatean(index){
                this.upvideomodal=true
                this.updatevideodata=this.video[index]
            },
            updatevideo(){
                this.$axios({
                    url:'/cate/updatevideo',
                    methods:'get',
                    params:{
                        videoId:this.updatevideodata.videoId,
                        video_remark:this.updatevideodata.video_remark,
                        video_password:this.updatevideodata.video_password,
                        video_name:this.updatevideodata.video_name,
                        video_url:this.updatevideodata.video_url,
                        typeId:this.updatevideodata.typeId
                    }
                }).then(res => {
                    if(res.data.code==200){
                        this.success(res.data.msg)
                        this.getcatelist()
                        this.updatevideodata=null;
                        this.upvideomodal=false;
                        this.cancel()
                    }
                })
            }
        },
    }
</script>