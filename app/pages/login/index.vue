<template>
  <div>
    <div class="col-sm-12 col-md-6 offset-md-3">
      <p class="text-center">If you do not have an account, one will be created with the credentials provided.</p>
      <div class="alert alert-danger alert-dismissible text-center" v-if="error">
        <p>{{ error }}</p>
      </div>
      <form method="POST" v-on:submit.prevent="signIn">
        <div :class="{'form-group username-field': true, 'has-danger': errors.has('username') }">
          <span v-show="errors.has('username')" class="form-control-feedback">{{ errors.first('username') }}</span>
          <input class="form-control" type="text" name="username" placeholder="Username" v-model="credentials.username" maxlength="16" v-validate="'required|max:16'">
        </div>
        <div :class="{'form-group password-field': true, 'has-danger': errors.has('password') }">
          <span v-show="errors.has('password')" class="form-control-feedback">{{ errors.first('password') }}</span>
          <input class="form-control" type="password" name="password" placeholder="Password" v-model="credentials.password" maxlength="64" v-validate="'required|min:6|max:64'">
        </div>
  
        <button class="btn btn-block btn-primary">Sign In</button>
        <hr/>
        <a href="/api/v1/auth/github" class="btn btn-block btn-info">
          <span class="fa fa-github"></span> Sign In with GitHub</a>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      credentials: {
        username: '',
        password: '',
      },
      error: '',
      redirect: null,
    };
  },
  created() {
    if (this.$route.query && this.$route.query.id && this.$route.query.token) {
      this.verifyToken(this.$route.query.id, this.$route.query.token);
    }
  },
  methods: {
    signIn() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.$axios.post('/api/v1/auth/login', this.credentials).then((data) => {
            this.$store.dispatch('onLogin', data);
            this.$router.push(this.$route.meta.redirect);
          }).catch((err) => {
            this.error = err;
          });
        }
      });
    },
    verifyToken(id, token) {
      this.$router.replace({ query: {} });
      this.$axios.post('/api/v1/auth/token', { id, token }).then((data) => {
        this.$store.dispatch('onLogin', data);
        this.$router.push(this.$route.meta.redirect);
      }).catch(() => {
        this.error = 'Failed to validate token';
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    if (from.meta.redirect) {
      to.meta.redirect = from.meta.redirect; // eslint-disable-line
      Reflect.deleteProperty(from.meta, 'redirect');
    } else {
      to.meta.redirect = from.path; // eslint-disable-line
    }
    next();
  },
};
</script>

<style lang="scss" scoped>
input,
.btn {
  border-radius: 0;
}

.btn:enabled {
  cursor: pointer;
}

a[disabled="disabled"] {
  pointer-events: none;
  cursor: not-allowed;
}
</style>