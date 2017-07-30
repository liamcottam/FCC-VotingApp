<template>
  <div v-if="loaded">
    <div v-if="fatalError">
      <div class="error-template">
        <div class="error-actions">
          <b-button variant="success" :to="{ name: 'home' }">
            <span class="fa fa-home"></span> Go Home</b-button>
        </div>
      </div>
    </div>
    <div v-else>
      <b-alert class="text-center" variant="danger" :show="error !== null" v-if="error !== null" dismissible>
        <p>{{ error.msg }}</p>
      </b-alert>
      <div class="row">
        <div :class="(this.data.votes === 0) ? 'no-votes col-lg-6 offset-lg-3' : 'col-lg-4'">
          <div class="left-container">
            <div>
              <form method="POST" v-on:submit.prevent="vote" v-if="data === null || typeof data.voted_for === 'undefined'">
                <h4 v-if="!deleted">Cast your vote!</h4>
                <b-input-group left="Vote For" class="mb-2">
                  <b-form-select v-model="form.selected" :options="options" />
                </b-input-group>
                <b-form-input class="mb-2" v-model="form.customoption" v-if="!deleted && options !== null && options.indexOf(form.selected) >= num" placeholder="Enter your custom option..." />
                <b-button type="submit" variant="primary" v-if="!deleted" block>Submit Vote</b-button>
              </form>
              <div v-else>
                <p>You voted for
                  <br/>
                  <b>{{ getVotedFor }}</b>
                  <br/>Which is {{ getNextTop }}</p>
              </div>
              <b-button variant="danger" @click.prevent="deletePoll" v-if="!deleted && data !== null && data.owner === true" block>Delete Poll</b-button>
            </div>
          </div>
        </div>
        <div class="col-lg-8" v-if="this.data !== null && this.data.votes !== 0">
          <div class="col-lg-8 offset-lg-2 col-md-10 offset-md-1">
            <chart :chartData="boardData" ref="chart"></chart>
          </div>
        </div>
      </div>
      <div class="link-container">
        <b-input-group left="Link" right="asd" class="mb-1" v-if="!deleted">
          <template slot="right">
            <div class="input-group-addon" v-clipboard:success="onCopy" v-clipboard:copy="location">
              <b-popover placement="top" triggers="hover" :content="urlcopy">
                <span class="fa fa-copy"></span>
              </b-popover>
            </div>
          </template>
          <b-form-input :value="location" disabled></b-form-input>
        </b-input-group>
      </div>
    </div>
  </div>
</template>

<script>
import { setTitle } from '../../util/helpers';
import chart from './chart';

export default {
  components: {
    chart,
  },
  data() {
    return {
      form: {
        selected: null,
        customoption: null,
      },
      options: [],
      num: null,
      error: null,
      boardData: null,
      data: null,
      urlcopy: 'Copy URL',
      location: null,
      fatalError: null,
      ignoreNext: null,
      deleted: false,
      loaded: false,
      ignored: false,
    };
  },
  computed: {
    getVotedFor() {
      return (typeof this.data.voted_for !== 'undefined')
        ? this.data.options[this.data.voted_for].text
        : null;
    },
    getNextTop() {
      if (typeof this.data.voted_for !== 'undefined') {
        const votedFor = this.data.options[this.data.voted_for].votes;

        let next = this.data.options.slice();
        next.splice(this.data.voted_for, 1);
        next = next.sort((a, b) => a.votes < b.votes)[0].votes;

        if (next === votedFor) {
          return `in a draw at ${next} vote${(next > 1) ? 's' : ''} 😟`;
        } else if (next > votedFor) {
          return `losing by ${next - votedFor} vote${(next > 1) ? 's' : ''} 😢`;
        } else if (next < votedFor) {
          return `in the lead by ${votedFor - next} vote${(next > 1) ? 's' : ''}! 🎉`;
        }
      }
      return null;
    },
  },
  beforeDestroy() {
    this.$socket.emit('part');
    delete this.$options.sockets.data;
    delete this.$options.sockets.connect;
  },
  created() {
    this.$store.watch(state => state.authenticated, (authenticated) => {
      if (!authenticated) {
        if (this.options.length >= this.num) {
          this.options.pop();
          if (this.options.indexOf(this.form.selected) === -1) {
            this.form.selected = null;
          }
        }
      }
    });

    this.location = window.location.href;

    this.$axios.get(`/api/v1/polls/${this.$route.params.id}`).then((data) => {
      setTitle(data.question);
      this.data = data;
      if (typeof data.voted_for !== 'undefined') this.voted_for = data.voted_for;
      this.options = this.data.options.map(o => o.text);
      this.options.unshift({
        text: 'Select an option...',
        value: null,
        disabled: true,
      });
      this.num = this.options.length;
      if (this.$store.state.authenticated) {
        this.options.push('Add another option...');
      }
      this.updateBoard();

      this.$socket.emit('join', this.$route.params.id);
      this.$options.sockets.connect = () => {
        this.$socket.emit('join', this.$route.params.id);
      };
      this.$options.sockets.data = (voteData) => {
        this.update(voteData);
      };
      this.$options.sockets.deleted = () => {
        this.deleted = true;
        this.showError({ msg: 'This poll has been deleted' });
        this.$socket.emit('part');
        delete this.$options.sockets.data;
        delete this.$options.sockets.connect;
      };
      this.loaded = true;
    }).catch((err) => {
      setTitle('This poll cannot be found or has been deleted');
      this.fatalError = err;
    });
  },
  methods: {
    vote() {
      if (this.form.selected === null
        && this.options.indexOf(this.form.selected) < this.num) return;
      const form = { selected: this.form.selected };
      if (this.options.indexOf(form.selected) >= this.num) {
        this.data.options.push({ text: this.form.customoption, votes: 0 });
        form.selected = this.form.customoption;
      }

      this.ignoreNext = this.data.options.findIndex(o => o.text === form.selected);

      this.$axios.patch(`/api/v1/polls/${this.$route.params.id}`, form).then(() => {
        this.data.options[this.ignoreNext].votes += 1;
        this.data.voted_for = this.ignoreNext;
        this.data.votes += 1;
        this.updateBoard();
      }).catch((err) => {
        this.showError(err);
      });
    },
    update(voteData) {
      if (this.ignoreNext && voteData.index === this.ignoreNext && !this.ignored) {
        this.ignored = true;
        return;
      }

      if (voteData.option) {
        this.data.options.push({ text: voteData.option, votes: voteData.votes });
        this.num += 1;
        if (this.$store.state.authenticated) {
          this.options.splice(this.options.length - 1, 0, voteData.option);
        } else {
          this.options.push(voteData.option);
        }
      } else {
        this.data.options[voteData.index].votes = voteData.votes;
      }
      this.updateBoard();
    },
    updateBoard() {
      const boardData = {
        labels: [],
        datasets: [{
          backgroundColor: [],
          data: [],
        }],
      };
      if (this.boardData !== null) {
        boardData.datasets[0].backgroundColor = this.boardData.datasets[0].backgroundColor.slice();
      }
      boardData.datasets[0].data = this.data.options.map(o => o.votes);
      for (let i = boardData.datasets[0].backgroundColor.length;
        i < boardData.datasets[0].data.length;
        i += 1) {
        boardData.datasets[0].backgroundColor.push(this.generateColor());
      }
      boardData.labels = this.data.options.map(o => o.text);
      this.boardData = boardData;
    },
    generateColor() {
      return `#${((1 << 24) * Math.random() | 0).toString(16)}`; // eslint-disable-line
    },
    showError(err) {
      this.error = err;
    },
    deletePoll() {
      this.$axios.delete(`/api/v1/polls/${this.$route.params.id}`).then(() => {
        this.$router.push({ name: 'home' });
      }).catch((err) => {
        this.showError(err);
      });
    },
    onCopy() {
      this.urlcopy = 'URL Copied!';
    },
  },
};
</script>

<style scoped>
.link-container {
  margin-top: 2rem;
}

.custom-vote {
  margin-bottom: 0.25rem;
}

.no-votes {
  margin-top: 10%;
  margin-bottom: 10%;
}

.row {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.error-actions {
  margin-top: 0;
}

select {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.left-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
  text-align: center;
}

.left-container .btn-danger {
  margin-top: 0.5rem;
}

.left-container p {
  margin: 0;
}
</style>