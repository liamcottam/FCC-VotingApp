import Vue from 'vue';
import VueRouter from 'vue-router';

import { setLoading, setTitle } from '../util/helpers';
import Auth from './auth';
import Home from '../pages/home';
import Login from '../pages/login';
import CreatePoll from '../pages/createPoll';
import Poll from '../pages/poll';
import UserPolls from '../pages/userPolls';
import Account from '../pages/account';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: 'Home',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'Sign In',
        guest: true,
      },
    },
    {
      path: '/polls/new',
      name: 'createPoll',
      component: CreatePoll,
      meta: {
        title: 'New Poll',
        auth: true,
      },
    },
    {
      path: '/polls/user/:id',
      name: 'userPolls',
      component: UserPolls,
      meta: {
        title: 'User Polls',
      },
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      meta: {
        title: 'Your Account',
        auth: true,
      },
    },
    {
      name: 'viewPoll',
      path: '/polls/:id',
      component: Poll,
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.auth && !Auth.state.authenticated) {
    next('/login');
    return;
  } else if (to.meta.guest && Auth.state.authenticated) {
    next('/');
    return;
  }

  if (to.hash === '#') {
    next(false);
  } else {
    setLoading(false);
    if (to.meta.title) {
      setTitle(to.meta.title);
    }
    next();
  }
});

export default router;
