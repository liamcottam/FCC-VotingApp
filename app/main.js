import Vue from 'vue';
import VueBus from 'vue-bus';
import VueSocketio from 'vue-socket.io';
import BootstrapVue from 'bootstrap-vue';
import VueClipboard from 'vue-clipboard2';

import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'font-awesome/css/font-awesome.min.css';

import './util/vuex';
import './util/network';
import './util/validator';
import './loading.css';
import router from './util/router';
import store from './util/auth';

import App from './App';

Vue.use(VueBus);
Vue.use(VueSocketio, window.location.host);
Vue.use(BootstrapVue);
Vue.use(VueClipboard);

if (process.env.NODE_ENV !== 'production') {
  Vue.config.debug = true;
}
Vue.config.productionTip = false;

Vue.mixin({
  created() {
    this.$appName = process.env.APP_NAME;
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
