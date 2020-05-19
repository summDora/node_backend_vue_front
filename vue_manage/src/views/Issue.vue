<style scoped>
   @import './issue.scss';
</style>
<template>
    <div class="issue">
        <Select 
        v-model="model1"
        @on-select='select' 
        style="width:200px;margin:20px 10px 30px 20px">
            <Option v-for="item in catelist" :value="item.typeId" :key="item.typeId">{{ item.type_name }}</Option>
        </Select>
        <Button type="success" size="small" @click="getissuelist()" style="margin-top:20px;height:32px;width:70px;margin-right:10px">查看问题</Button>
        <Button type="warning" size="small" @click="open()" style="margin-top:20px;height:32px;width:70px;margin-right:50%">新增问题</Button>
        <br>
        <Table  :columns="columns" border="" :data="data" style="width:100%">
            <template slot-scope="{ row }" slot="name">
                <strong>{{ row.name }}</strong>
            </template>
            <template slot-scope="{ row }" slot="action">
                <Button type="primary" size="small" style="margin-right: 5px" @click="show(row)">修改</Button>
                <Button type="error" size="small" @click="remove(row)">删除</Button>
            </template>
        </Table>
        <Modal v-model="comfirmmodal" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle-outline" style="size:30;marginRight:10px;verticalAlign: baseline"/>
                <span>Delete confirmation</span>
            </p>
            <div style="text-align:center">
                <p>是否确认删除这条数据？</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long  @click="del">Delete</Button>
            </div>
        </Modal>

        <Drawer
            :title="modeltitle"
            v-model="drawer"
            :mask-closable="false"
            width="720"
            :styles="styles"
        >
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
                <FormItem label="问题名称" prop="text">
                    <Input v-model="formValidate.text" placeholder="Enter your issue"></Input>
                </FormItem>
                <FormItem label="所属类别" prop="cate">
                    <Input v-model="selecttext" disabled></Input>
                </FormItem>
                <editor-bar  v-model="detail" ref="childe" :isClear="isClear" @change="change" style="marginBottom:40px"></editor-bar>
                <FormItem>
                    <Button type="warning" v-if="modeltitle=='新增问题'" @click="handleSubmit('formValidate')">添加</Button>
                    <Button v-if="modeltitle=='修改问题'" type="primary" @click="updateIssue('formValidate')">修改</Button>
                    <Button @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>
                </FormItem>
            </Form>
        </Drawer>    
        
    </div>
</template>
<script>
import EditorBar from './../components/wangEditor'
    export default {
        components:{ EditorBar },
        data () {
            return {
                //富文本编辑器
                drawer:false,
                styles: {
                    height: 'calc(100% - 55px)',
                    overflow: 'auto',
                    paddingBottom: '53px',
                    position: 'static'
                },
                drawerhtml:null,
                isClear: false,
                detail:"",
                comfirmmodal:false,  //删除问题确认框
                delid:null, //删除id
                delanswerid:null,//删除答案 id
                deleanswer:false, //删除答案确认框
                updateanswer:false,//修改答案确认框
                updateanswerdate:null,//修改某条答案
                uploadParams:{
                    token:'',
                    key:'',
                },
                answer:[],
                columns: [
                    {
                        title: '问题',
                        key: 'is_title',
                    },
                    {
                        title: '可能原因及解决办法',
                        key: 'content',
                        render:(h,params)=> {
                            return h('div',{
                                domProps:{
                                    innerHTML:`${params.row.content}`
                                    }

                            })
                        },

                    },
                    {
                        title: '问题创建人',
                        key: 'userName'
                    },
                    {
                        title: 'Action',
                        slot: 'action',
                        align: 'center'
                    }
                ],
                oldinfo:{},
                modeltitle:'新增问题',
                data: [],
                catelist:[],
                model1: '',
                selectid:null,
                issueId:null,
                selecttext:'',
                addmodel:false,
                formValidate: {
                    text: '',
                },
                ruleValidate: {
                    text: [
                        { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                    ],
                    
                }
            }
        },
        created() {
            this.getcatelist();
        },
        methods: {
            success (msg) {
                this.$Message.success(msg);
            },
            error(msg) {
                this.$Message.error(msg);
            },
            select(val){
                this.selectid=val.value 
                this.selecttext=val.label 
            },
            open(){
                this.modeltitle='新增问题';
                this.drawerhtml='';
                if(!this.selectid){
                    this.error('请先选择问题类别，添加新问题')
                }else{
                    this.handleReset('formValidate');
                    this.drawer=true
                }
            },
            show(item){
                this.$refs.childe.editor.txt.html('')
                this.handleReset('formValidate');
                this.drawer=true;
                this.oldinfo=item;
                this.modeltitle='修改问题'
                this.selectid=item.typeId
                this.issueId=item.issueId
                this.formValidate.text=item.is_title
                this.$refs.childe.editor.txt.html(item.content)
            },
            getcatelist(){
                this.$axios({
                    url:'/cate/getcatelist',
                    methods:'get',
                }).then(res => {
                    let data=res.data.data
                    this.catelist=data
                })
            },
            getissuelist(){
                this.data=[];
                if(this.selectid){
                    this.$axios({
                        url:'/issue/getissuelist',
                        methods:'get',
                        params:{
                            typeId:this.selectid
                        }
                    }).then(res => {
                        let data=res.data.data
                        if(res.data.msg!=''){
                            this.$Message.success(res.data.msg)
                        }else{
                            this.data=data
                        }
                    })
                }else{
                    this.$Message.error('请先选择问题类别！')
                }
                
            },
            handleSubmit (name) {
                console.log(this.drawerhtml);
                
                this.$refs[name].validate((valid) => {
                    let userinfo=JSON.parse(this.getCookie('userinfo'))
                    if(userinfo.id && userinfo.name){
                        if (valid) {
                            this.$axios({
                                url:'/issue/addissue',
                                methods:'get',
                                params:{
                                    typeId:this.selectid,
                                    userId:userinfo.id,
                                    userName:userinfo.name,
                                    is_title:this.formValidate.text,
                                    content:this.drawerhtml,
                                }
                            }).then(res => {
                                if(res.data.msg!='添加成功'){
                                    this.$Message.error(res.data.msg);
                                }else{
                                    this.$Message.success(res.data.msg);
                                    this.handleReset('formValidate');
                                    /* this.addmodel=false; */
                                    this.drawer=false
                                    this.drawerhtml=null;
                                    this.getissuelist()
                                }
                            }).catch(err=>{
                                console.log(err);
                            })
                        } else {
                            this.$Message.error('请输入问题名称！');
                        } 
                    }else{
                        this.$router.push({path:'/login'})
                    }
                })
            },
            updateIssue(name){
                this.$refs[name].validate((valid) => {
                    let userinfo=JSON.parse(this.getCookie('userinfo')) 
                    if(userinfo.id && userinfo.name){
                        if (valid) {
                            this.$axios({
                                url:'/issue/updateissue',
                                methods:'get',
                                params:{
                                    issueId:this.issueId,
                                    typeId:this.selectid,
                                    userId:userinfo.id,
                                    userName:userinfo.name,
                                    is_title:this.formValidate.text,
                                    content:this.$refs.childe.editor.txt.html()
                                }
                            }).then(res => {
                                if(res.data.msg!='修改成功'){
                                    this.$Message.error(res.data.msg);
                                }else{
                                    this.$Message.success(res.data.msg);
                                    this.handleReset('formValidate');
                                    /* this.addmodel=false; */
                                    this.drawer=false;
                                    this.drawerhtml=null;
                                    this.getissuelist()
                                }
                            }).catch(err=>{
                                console.log(err);
                            })
                           
                        } else {
                            this.$Message.error('请输入问题名称！');
                        }
                    }else{
                        this.$router.push({path:'/login'})
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
                this.drawerhtml='';
            },
            //删除操作
            del(){
                this.$axios({
                    url:'/issue/delissue',
                    methods:'get',
                    params:{
                        issueId:this.delid
                    }
                }).then(res => {
                    this.$Message.success(res.data.msg);
                    this.getissuelist();
                    this.delid=null
                    this.comfirmmodal=false
                })
            },
            //打开删除确认框
            remove(item){
                this.delid=item.issueId
                this.comfirmmodal=true
            },


            change(val) {
                this.drawerhtml=val
                
            },




            
        },
    }
</script>