<template>
  <div>
    <b-list-group>
      <b-list-group-item :to="{ name: 'viewPoll', params: { id: item._id } }" v-for="(item, index) in polls" :key="item._id">
        <div>
          <span class="float-left">{{ item.question }}</span>
          <span class="float-right">
            <b-badge variant="success" v-if="isOwnProfile">Owner</b-badge>
            <span v-if="item.votes > 0">
              <b-badge variant="danger" v-if="typeof item.voted_for !== 'undefined'">You voted for '{{ item.voted_for }}'</b-badge>
              <b-badge variant="danger" v-if="typeof item.user_voted_for !== 'undefined'">User voted for '{{ item.user_voted_for }}'</b-badge>
              <b-badge variant="info">{{ item.most_popular.percent }}% voted '{{ item.most_popular.text }}'</b-badge>
              <b-badge variant="primary">{{ item.votes }} {{ (item.votes > 1) ? 'votes' : 'vote'}}</b-badge>
              <b-button variant="danger" size="sm" v-if="isOwnProfile" v-on:click.prevent="deletePoll(item._id, index)">Delete</b-button>
            </span>
            <span v-else>
              <b-badge variant="danger">New</b-badge>
              <b-button variant="danger" size="sm" v-if="isOwnProfile" v-on:click.prevent="deletePoll(item._id, index)">Delete</b-button>
            </span>
          </span>
        </div>
      </b-list-group-item>
    </b-list-group>
    <div class="text-center" v-if="error">
      <div class="error-template">
        <h3 v-if="error === 'NoItems'">{{ errorMessage }}</h3>
        <div class="error-actions">
          <template v-if="error === 'NoItems'">
            <b-button variant="success" :to="{ name: 'createPoll' }" v-if="isOwnProfile">
              <span class="fa fa-plus"></span> Create New</b-button>
            <b-button variant="primary" @click="loadData">
              <span class="fa fa-refresh"></span> Refresh</b-button>
          </template>
          <b-button variant="success" :to="{ name: 'home' }">
            <span class="fa fa-home"></span> Go Home</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setTitle } from '../../util/helpers';

export default {
  data() {
    return {
      error: null,
      polls: [],
    };
  },
  methods: {
    loadData() {
      this.$axios.get(`/api/v1/profiles/${this.$route.params.id}`).then((data) => {
        this.error = null;
        this.polls = data;
        this.checkPollLength();
      }).catch((err) => {
        setTitle(err);
        this.error = err;
      });
    },
    deletePoll(id, index) {
      this.$axios.delete(`/api/v1/polls/${id}`).then(() => {
        this.polls.splice(index, 1);
        this.checkPollLength();
      }).catch(() => {
      });
    },
    checkPollLength() {
      if (this.polls.length === 0) {
        this.error = 'NoItems';
      }
    },
  },
  computed: {
    authenticated() {
      return this.$store.state.authenticated;
    },
    isOwnProfile() {
      const json = JSON.parse(localStorage.getItem('userdata'));
      if (this.$store.state.authenticated && this.$route.params.id === json.id) {
        return true;
      }
      return false;
    },
    errorMessage() {
      if (this.error === 'NoItems') {
        if (this.isOwnProfile) {
          return 'You have not created any polls, fancy creating one?';
        }
        return 'This user has not created any polls.';
      }
      return this.error;
    },
  },
  created() {
    const json = JSON.parse(localStorage.getItem('userdata'));
    if (this.$store.state.authenticated && this.$route.params.id === json.id) {
      setTitle('Your Polls');
    }

    this.$store.watch(state => state.authenticated, (authenticated) => {
      if (!authenticated) {
        setTitle(this.$route.meta.title);
      }
    });

    this.loadData();
  },
};
</script>