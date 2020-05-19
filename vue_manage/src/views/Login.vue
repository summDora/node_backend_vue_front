<style lang="scss">
    @import './login.scss';
</style>

<template>
 <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
            <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
                <FormItem prop="userName">
                    <Input v-model="form.userName" placeholder="请输入用户名" >
                        <span slot="prepend">
                        <Icon :size="16" type="ios-person"></Icon>
                        </span>
                    </Input>
                </FormItem>
                <FormItem prop="password">
                <Input type="password" v-model="form.password" placeholder="请输入密码" />
                    <span slot="prepend">
                    <Icon :size="14" type="md-lock"></Icon>
                    </span>
                <!-- </Input> -->
                </FormItem>
                <FormItem>
                <Button @click="handleSubmit" type="primary" long>登录</Button>
                </FormItem>
            </Form>
          <p class="login-tip">输入任意用户名和密码即可</p>
        </div>
      </Card>
    </div>
  </div>
</template>
<script>
// @ is an alias to /src
/* import HelloWorld from '@/components/HelloWorld.vue' */

export default {
  name: 'Login',
/*   components: {
    HelloWorld
  } */
  data() {
      return {
          
      }
  },
}
</script>

<script>

import { mapActions } from 'vuex'
export default {
  name: 'Login',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  data () {
    return {
      form: {
        userName: '',
        password: ''
      }
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        password: this.passwordRules
      }
    }
  },
  methods: {
    success (msg) {
        this.$Message.success(msg);
    },
    warning (msg) {
        this.$Message.warning(msg);
    },
    error(msg) {
        this.$Message.error(msg);
    },
    handleSubmit () {
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {            
            this.$axios({
                url:'/user/login',
                method:'get',
                params:{
                    username:this.form.userName,
                    password:this.form.password
                }
            }).then(res => {
                let data=res.data
                if(data.msg!='登录成功'){
                    this.error(data.msg)
                }else{
                  let userinfo={
                    id:data.data.userId,
                    name:data.data.userName,
                    role:data.data.role
                  }
                  this.setCookie('userinfo',JSON.stringify(userinfo))
                  this.$router.push({path:'/cate'})
                }
                
            })
        }
      })
    }
  }
}
</script>
