/* import axios from '@/libs/api.request' */

export const login = ({ userName, password }) => {
  this.$axios({
    url:'/user/login',
    method:'get',
    data:{
      username:userName,
      password:password
    }
  })
  return 
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'get_info',
    params: {
      token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}

