import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
/*     meta: {
      requireAuth: true, // 判断是否需要登录
    }, */
    redirect:'/cate',
    component: Home,
    children:[
      {
        path: '/user',
        name: 'User',
        component: () => import('../views/User.vue')
      },
      {
        path: '/issue',
        name: 'Issue',
        component: () => import('../views/Issue.vue')
      },
      {
        path: '/cate',
        name: 'Cate',
        component: () => import('../views/Cate.vue')
      },
    ]
  },
  {
    path:'/login',
    name:'Login',
    component:()=>import('../views/Login')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
function getCookie(key){
	var str=document.cookie.replace(/;\s*/,';');
	var cookieArr=str.split(';');
	var cookieObj={};v 
	var len=cookieArr.length;
	for(var i=0; i<len; i++){
		var item=cookieArr[i];
		var k=item.split('=')[0];
		var v=item.split('=')[1];
		cookieObj[k]=v;
	}
	if(cookieObj[key]){
		return decodeURIComponent(cookieObj[key]);
	}else{
		return false;
	}
}
router.beforeEach((to,from,next)=>{
  if(!getCookie('userinfo')){
    if(to.name!='Login'){
      next({path:'/login'})
    }
  }
  next()
}) 


export default router
