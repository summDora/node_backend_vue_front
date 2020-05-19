<style scoped>
    .expand-row{
        margin-bottom: 20px;
    }
    .expand-key{
        font-weight: bolder;
    }
    .expand_value{
        margin-right:60px
    }
</style>
<template>
    <div v-if="!nodata">
        <Row class="expand-row">
            <Col span="23" v-if="row.coverimg">
                <span class="expand-key">设备部件图: </span>
                <span class="expand-value">{{ row.coverimg }}</span>
            </Col>
        </Row>
        <Row class="expand-row"  v-for="(item, index) in row.video" :key='index'>
            <Col span="8">
                <span class="expand-key"> 视频名称: </span>
                <span class="expand-value">{{ item.video_name}}</span>
            </Col>
             <Col span="6">
                <span class="expand-key"> 提取密码: </span>
                <span class="expand-value">{{ item.video_password}}</span>
            </Col>
            <Col span="10">
                <span class="expand-key"> 视频备注: </span>
                <span class="expand-value">{{ item.video_remark}}</span>
            </Col>
            <Col span="24">
                <span class="expand-key"> 视频地址: </span>
                <span class="expand-value">{{ item.video_url}}</span>
            </Col>
        </Row>
    </div>
    <div v-else style="textAlign:center;">
        暂无数据
    </div>
</template>
<script>
    export default {
        props: {
            row: Object
        },
        data() {
            return {
                nodata:false
            }
        },
        created(){
            console.log(this.row);
            if(this.row.coverimg==null && this.row.video.length==0){
                this.nodata=true
            }
        }
    };
</script>