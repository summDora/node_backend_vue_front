import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
Vue.prototype.$axios=axios
if (process.env.NODE_ENV == 'development') {    
  axios.defaults.baseURL = '本地地址';
}else if (process.env.NODE_ENV == 'production') {    
  axios.defaults.baseURL = '线上地址';
}

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import '../my-theme/dist/iview.css';
Vue.use(ViewUI);

function setCookie(key, value, t){
	var oDate=new Date();
	oDate.setDate(oDate.getDate()+t);
	document.cookie=key+"="+encodeURIComponent(value)+";expires="+oDate.toUTCString();
}
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
function removeCookie(key){
	document.cookie=key+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
Vue.prototype.setCookie = setCookie; 
Vue.prototype.getCookie = getCookie; 
Vue.prototype.removeCookie = removeCookie; 

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
