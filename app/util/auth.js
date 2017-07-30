import Vuex from 'vuex';
import axios from 'axios';

// const LOGIN_URL = '/api/v1/auth';
const VALIDATE_URL = '/api/v1/validate';

export default new Vuex.Store({
  name: 'auth',
  state: {
    authenticated: localStorage.getItem('access_token') !== null,
  },
  mutations: {
    setAuthenticated(state, value) {
      state.authenticated = value; // eslint-disable-line no-param-reassign
    },
  },
  getters: {
    userdata: state => state.userdata,
    authenticated: state => state.authenticated,
  },
  actions: {
    onLogin(context, data) {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('userdata', JSON.stringify(data.userdata));
      context.commit('setAuthenticated', true);
    },
    logout(context) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('userdata');
      context.commit('setAuthenticated', false);
    },
    validate(context) {
      if (!localStorage.getItem('access_token')) return;
      axios.get(VALIDATE_URL, localStorage.getItem('access_token')).catch(() => {
        context.dispatch('logout');
      });
    },
  },
});
