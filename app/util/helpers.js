import Vue from 'vue';

export const setLoading = function setLoading(loading = false) {
  Vue.bus.$emit('loadingToggle', loading);
};

export const setTitle = function setTitle(title) {
  document.title = `${title} - ${process.env.APP_NAME}`;
  Vue.bus.$emit('setTitle', title);
};
