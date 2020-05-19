<template>
    <div class="user">
        <Table  :columns="columns" :data="data" style="flex:1;min-width:550px;max-width:700px">
            <template slot-scope="{ row }" slot="name">
                <strong>{{ row.name }}</strong>
            </template>
            <template slot-scope="{ row }" slot="action">
                <Button type="primary" size="small" style="margin-right: 5px" @click="show(row)">修改</Button>
                <Button type="error" size="small" @click="remove(row)">删除</Button>
            </template>
        </Table>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                columns: [
                    {
                        title: '管理员',
                        key: 'userName'
                    },
                    {
                        title: '身份',
                        key: 'role'
                    },
                    {
                        title: 'Action',
                        slot: 'action',
                        width: 150,
                        align: 'center'
                    }
                ],
                data: []
            }
        },
        beforeMount() {
            this.getuserlist()
        },
        methods: {
            getuserlist(){
                this.$axios({
                    url:'/user/getuserlist',
                    methods:'get',
                }).then(res=>{
                    let data=res.data
                    this.data=data.data
                    console.log(data);
                    
                })
            },
        },
    }
</script>