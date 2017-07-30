import Vue from 'vue';
import Axios from 'axios';
import ErrorParser from './errorparser';
import { setLoading } from './helpers';

const axios = Axios.create();

axios.interceptors.request.use((config) => {
  setLoading(true);
  if (localStorage.getItem('access_token')) {
    config.headers.Authorization = `Token ${localStorage.getItem('access_token')}` // eslint-disable-line
  }
  return config;
}, (error) => {
  setLoading(false);
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  setLoading(false);
  return Promise.resolve(response.data);
}, (error) => {
  setLoading(false);
  return Promise.reject(ErrorParser.parse(error));
});

Vue.mixin({
  created() {
    this.$axios = axios;
  },
});

Vue.axios = axios;
