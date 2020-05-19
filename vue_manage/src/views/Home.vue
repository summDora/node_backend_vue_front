<style scoped>
   @import './home.scss';
</style>
<template>
    <div class="home">
        <Layout style="height:100%">
            <Sider ref="side1" hide-trigger collapsible :collapsed-width="78" v-model="isCollapsed" style="background:yellow">
              <img src="./../assets/logo.png" style="width:80%;margin:20px 5% 20px 5%" alt="">
                <Menu :active-name='current' theme="dark" width="auto" :class="menuitemClasses">
                   
                    <MenuItem name="Cate">
                        <router-link to='/cate'>
                            <Icon type="ios-analytics-outline" 
                            style="margin-right:8px;margin-bottom:4px"/><span>问题类别</span>
                        </router-link>
                    </MenuItem>
                    <MenuItem name="Issue">
                        <router-link to='/issue'>
                            <Icon type="ios-albums-outline"
                            style="margin-right:8px;margin-bottom:4px" /><span>问题详情</span>
                        </router-link>
                    </MenuItem>
                    <MenuItem name="User"> 
                        <router-link to='/user'>
                            <Icon type="ios-contact"
                            style="margin-right:8px;margin-bottom:4px"></Icon><span>账号管理</span>
                        </router-link>
                    </MenuItem> 
                    
                </Menu>
            </Sider>
            <Layout>
                <Header :style="{padding: 0}" class="layout-header-bar">
                    <Icon @click.native="collapsedSider" :class="rotateIcon" :style="{margin: '0 20px',color:'#5c6b77'}" type="ios-settings" size="24"></Icon>
                    <Poptip  
                    :style="{float:'right',marginRight:'20%'}"
                    placement="bottom-start">
                    <div slot="content">
                        <a style="color:#39f" @click="loginout">退出登录</a>
                    </div>
                         <Avatar icon="ios-person" size="large"  />
                    </Poptip>
                </Header>
                <Content :style="{margin: '20px', background: '#fff'}">
                   <router-view/>
                </Content>
            </Layout>
        </Layout>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                isCollapsed: false,
                current:'Cate'
            }
        },
        beforeMount() {
            this.current=this.$router.currentRoute.name          
        },
        computed: {
            rotateIcon () {
                return [
                    'menu-icon',
                    this.isCollapsed ? 'rotate-icon' : ''
                ]; 
                
            },
            menuitemClasses () {
                return [
                    'menu-item',
                    this.isCollapsed ? 'collapsed-menu' : ''
                ]
            }
        },
        methods: {
            collapsedSider () {
                this.$refs.side1.toggleCollapse();
            },
            loginout(){
                this.removeCookie('userinfo')
                this.$router.push({path:'/login'})
            }
        }
    }
</script>
