
import axiosClient from '../lib/axios';

const UserService = {
  getProfile: (opts = {}) => {
    return axiosClient.get('/api/users/profile', {
      skipAuthRedirect: !!opts.skipAuthRedirect
    });
  },

  login: (payload) => {
    return axiosClient.post('/api/users/login', payload);
  },

  logout: () => {
    return axiosClient.post('/api/users/logout');
  }
};

export default UserService;