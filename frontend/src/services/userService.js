import axiosClient from '../lib/axios.js';

const UserService = {
  getProfile: () => {
    return axiosClient.get('api/users/profile'); 
  },

  login: (payload) => {
    return axiosClient.post('/api/users/login', payload);
  },

  logout: () => {
    return axiosClient.post('/api/users/logout');
  }
};

export default UserService;