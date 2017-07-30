<template>
  <div>
    <b-list-group v-if="error === null">
      <b-list-group-item :to="{ name: 'viewPoll', params: { id: item._id} }" v-for="item in polls" :key="item._id">
        <div>
          <span class="float-left">{{ item.question }}</span>
          <span class="float-right">
            <b-badge variant="success" v-if="typeof item.owner !== 'undefined' && authenticated">Owner</b-badge>
            <span v-if="item.votes > 0">
              <b-badge variant="danger" v-if="typeof item.voted_for !== 'undefined' && authenticated">You voted for '{{ item.voted_for }}'</b-badge>
              <b-badge variant="info">{{ item.most_popular.percent }}% voted '{{ item.most_popular.text }}'</b-badge>
              <b-badge variant="primary">{{ item.votes }} {{ (item.votes > 1) ? 'votes' : 'vote'}}</b-badge>
            </span>
            <span v-else>
              <b-badge variant="danger">New</b-badge>
            </span>
          </span>
        </div>
      </b-list-group-item>
    </b-list-group>
    <div class="text-center" v-else>
      <div class="error-template">
        <h3>{{ errorMessage }}</h3>
        <div class="error-actions">
          <b-button variant="success" :to="{ name: 'createPoll' }" v-if="authenticated">
            <span class="fa fa-plus"></span> Create New</b-button>
          <b-button variant="success" @click.prevent="signupNoItems" v-else>
            <span class="fa fa-user-plus"></span> Sign Up</b-button>
          <b-button variant="primary" @click="loadData">
            <span class="fa fa-refresh"></span> Refresh</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      error: null,
      polls: [],
      timer: null,
    };
  },
  created() {
    this.$bus.$on('refreshHome', this.loadData);
    this.loadData();
  },
  beforeDestroy() {
    this.$bus.off('refreshHome', this.refreshHome);
    clearTimeout(this.timer);
  },
  methods: {
    loadData() {
      clearTimeout(this.timer);
      if (this.$route.name !== 'home') return;

      this.$axios.get('/api/v1/polls').then((data) => {
        if (data.length === 0) {
          this.error = 'NoItems';
          this.timer = setTimeout(() => {
            this.loadData();
          }, 5000);
          return;
        }
        clearTimeout(this.timer);
        this.error = null;
        this.polls = data;
      }).catch(() => {
        this.error = 'Oops! An unknown error occurred!';
      });
    },
    signupNoItems() {
      this.$route.meta.redirect = { name: 'createPoll' };
      this.$router.push({ name: 'login' });
    },
  },
  computed: {
    errorMessage() {
      if (this.error === 'NoItems') {
        if (this.authenticated) {
          return 'There are no polls, fancy creating one or refreshing until one is ready?';
        }
        return 'There are no polls, sign up to create one one or refresh until one is ready.';
      }
      return this.error;
    },
    ...mapState([
      'authenticated',
    ]),
  },
};
</script>