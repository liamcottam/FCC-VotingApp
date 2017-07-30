<template>
  <form role="form" v-on:submit.prevent="createPoll">
    <b-alert variant="danger" v-if="error !== null" :show="error !== null" @dismissed="error=null" dismissible>
      <p>{{ error.msg }}
        <router-link v-if="error.redirect" :to="error.redirect.replace('/api/v1', '')">here</router-link>
      </p>
    </b-alert>
    <div :class="{'form-group': true, 'has-danger': errors.has('question') }">
      <label for="question">Question: </label>
      <input class="form-control" type="text" name="question" placeholder="Type your question" v-model="data.question" v-validate="'required'">
      <span v-show="errors.has('question')" class="form-control-feedback">{{ errors.first('question') }}</span>
    </div>
  
    <label>Options (2 options minimum): </label>
    <template v-for="(option, index) in data.options">
      <div class="form-group" v-bind:key="index">
        <input class="form-control" name="options" placeholder="Enter an option here" rows="4" v-model="data.options[index]"></input>
      </div>
    </template>
    <input type="submit" value="Create" class="btn btn-primary">
  </form>
</template>

<script>
export default {
  name: 'CreatePoll',
  data() {
    return {
      data: {
        question: '',
        options: [
          '',
          '',
        ],
      },
      error: null,
      submitted: false,
    };
  },
  watch: {
    'data.options': (val) => {
      const validItems = val
        .map(s => s.trim().replace(/\s\s+/g, ' '))
        .filter(s => s.length >= 1);

      if (validItems.length === val.length) {
        val.push('');
      }
    },
  },
  methods: {
    createPoll() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.$axios.post('/api/v1/polls', this.data).then((data) => {
            this.submitted = true;
            this.$router.push({ name: 'viewPoll', params: { id: data.id } });
          }).catch((err) => {
            this.error = err;
          });
        }
      });
    },
  },
  computed: {
    isFormDirty() {
      /* eslint-disable arrow-body-style */
      if (!this.data.question && !this.data.options) return false;

      return Object.keys(this.fields).some((key) => {
        return this.fields[key].dirty || this.fields[key].invalid || this.fields[key].touched;
      });
    },
  },
  beforeRouteLeave(to, from, next) {
    /* eslint-disable no-alert */
    if (!this.$store.state.authenticated) {
      next();
    } else if (this.submitted || !this.isFormDirty || window.confirm('Not saved, are you sure you want to navigate away?')) {
      next();
    } else {
      next(false);
    }
  },
};
</script>

<style lang="scss" scoped>
.hover-error {
  cursor: pointer;
}
</style>
