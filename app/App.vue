<template>
  <div>
    <b-navbar toggleable type="inverse" variant="inverse" fixed="top">
      <div class="container">
        <b-nav-toggle target="nav_collapse"></b-nav-toggle>
        <b-link class="navbar-brand" to="/" @click.native="onHomeClick" event="''">
          <span>{{ $appName }}</span>
        </b-link>
        <b-collapse is-nav id="nav_collapse">
          <b-nav is-nav-bar>
            <b-nav-item :to="{ name: 'home' }" active-class="active" @click.native="onHomeClick" event="''" exact>Home</b-nav-item>
            <b-nav-item :to="{ name: 'createPoll' }" v-if="authenticated">New Poll</b-nav-item>
          </b-nav>
          <b-nav is-nav-bar class="ml-auto">
            <b-nav-item-dropdown right v-if="authenticated && userdata !== null">
              <template slot="button-content">
                <span>{{ userdata.username }}</span>
              </template>
              <b-dropdown-item :to="{ name: 'userPolls', params: { id: userdata.id} }">Your Polls</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'account' }" right>Account Settings</b-dropdown-item>
              <b-dropdown-item to="#" @click.prevent="logout">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item :to="{ name: 'login' }" right v-if="!authenticated">Sign In</b-nav-item>
          </b-nav>
        </b-collapse>
      </div>
    </b-navbar>
  
    <div class="container">
      <h1 class="mt-3 text-center header" v-if="(title) ? title : $route.meta.title">{{ (title) ? title : $route.meta.title }}</h1>
      <!-- <keep-alive include="Home"> -->
      <router-view></router-view>
      <!-- </keep-alive> -->
  
      <footer class="footer">
        <div class="footer-container">
          <p class="float-right">
            <a @click="scrollToTop" href="#">Back to top
              <span class="fa fa-arrow-up"></span>
            </a>
          </p>
          <a href="https://github.com/liamcottam/FCC-VotingApp">
            <span class="fa fa-github"></span> Source Code</a>
        </div>
      </footer>
    </div>
  
    <div class="loading-container" v-show="isLoading">
      <div class="sk-wave">
        <div class="sk-rect sk-rect1"></div>
        <div class="sk-rect sk-rect2"></div>
        <div class="sk-rect sk-rect3"></div>
        <div class="sk-rect sk-rect4"></div>
        <div class="sk-rect sk-rect5"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      isLoading: false,
      title: '',
      userdata: null,
    };
  },
  created() {
    this.$bus.$on('loadingToggle', (loading) => {
      this.isLoading = loading;
    });

    this.$bus.$on('setTitle', (title) => {
      this.title = title;
    });

    this.$store.watch((state) => {
      if (state.authenticated) {
        this.userdata = JSON.parse(localStorage.getItem('userdata'));
      }
    });
  },
  methods: {
    onHomeClick() {
      const temp = this.$route.path;
      this.$router.push('/');
      this.$bus.emit('refreshHome', temp);
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    logout() {
      this.$store.dispatch('logout');
      if (this.$route.meta.auth) {
        this.$router.push('/login');
      }
    },
  },
  computed: {
    ...mapState([
      'authenticated',
    ]),
  },
};
</script>

<style>
body {
  padding-top: 56px;
}

.footer {
  color: #636c72;
  height: 60px;
  line-height: 60px;
  background-color: #f5f5f5;
  margin-top: 1em;
}

a:focus,
a:hover {
  text-decoration: none;
}

.footer-container {
  margin-left: 1em;
  margin-right: 1em;
}

@media (max-width: 575px) {
  .navbar .container {
    margin-left: 0;
    margin-right: 0;
  }
}

.header {
  padding-bottom: 1.25rem;
  border-bottom: .05rem solid #eee;
  font-weight: 300;
}

.loading-container {
  position: absolute;
  margin-top: -60px;
  margin-left: -25px;
  top: 50%;
  left: 50%;
  user-select: none;
  cursor: default;
}

.alert p {
  margin: 0;
}

@media only screen and (max-width: 768px) {
  .list-group-item {
    justify-content: space-between;
    white-space: nowrap;
    overflow-x: scroll;
  }

  .list-group-item .float-right {
    margin-left: 8px;
    float: unset !important;
  }
}

.error-template {
  padding: 20px;
  text-align: center;
}

.error-actions {
  margin-top: 20px;
}

.error-actions .btn {
  cursor: pointer;
}

.list-group-item div {
  width: 100%;
}

.list-group-item p {
  margin-bottom: 0;
}
</style>