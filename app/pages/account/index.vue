<template>
  <div>
    <div class="row" v-if="!isOAuthUser">
      <div class="col-md-3" role="navigation">
        <nav class="menu">
          <h3 class="menu-heading">Personal settings</h3>
          <a class="menu-item selected">Account</a>
        </nav>
      </div>
      <div class="col-md-5">
        <form v-on:submit.prevent="changePassword">
          <h4>Change password</h4>
  
          <b-alert class="text-center" variant="danger" :show="shouldShowError" dismissible>
            <p>{{ error }}</p>
          </b-alert>
  
          <b-alert class="text-center" variant="success" :show="shouldShowSuccess" dismissible>
            <p>{{ success }}</p>
          </b-alert>
  
          <b-form-fieldset label="Current Password" :state="(this.errors.has('old_password')) ? 'danger': ''" :feedback="errors.first('old_password')">
            <b-form-input v-model="form.old_password" name="old_password" type="password" placeholder="Enter your current password" data-vv-as="old password" v-validate="'required|min:6'"></b-form-input>
          </b-form-fieldset>
  
          <b-form-fieldset label="New Password" :state="(this.errors.has('new_password')) ? 'danger': ''" :feedback="errors.first('new_password')">
            <b-form-input v-model="form.new_password" name="new_password" type="password" placeholder="Enter your new password" data-vv-as="new password" v-validate="'required|min:6'"></b-form-input>
          </b-form-fieldset>
  
          <b-form-fieldset label="Confirm New Password" :state="(this.errors.has('confirm_password')) ? 'danger': ''" :feedback="errors.first('confirm_password')">
            <b-form-input v-model="form.confirm_password" name="confirm_password" type="password" placeholder="Confirm your new password" data-vv-as="confirm password" v-validate="'required|min:6|confirmed:new_password'"></b-form-input>
          </b-form-fieldset>
  
          <b-button type="submit" variant="primary">Submit</b-button>
        </form>
      </div>
    </div>
    <div class="text-center" v-else>
      <div class="error-template">
        <h3>You cannot change your password as this account is managed by an external service.</h3>
        <small>... but I don't check if your OAuth token is still valid as I store nothing but your unique id and name</small>
        <div class="error-actions">
          <b-button variant="success" :to="{ name: 'home' }">
            <span class="fa fa-home"></span> Go Home</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'account',
  data() {
    return {
      form: {
        old_password: '',
        new_password: '',
        confirm_password: '',
      },
      dismissCountDown: null,
      error: null,
      success: null,
    };
  },
  computed: {
    isOAuthUser() {
      return JSON.parse(localStorage.getItem('userdata')).is_oauth;
    },
    shouldShowError() {
      return this.error !== null;
    },
    shouldShowSuccess() {
      return this.success !== null;
    },
  },
  methods: {
    changePassword() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.success = null;
          this.error = null;
          this.$axios.patch('/api/v1/account', this.form).then(() => {
            this.error = null;
            this.success = 'Password successfully changed';
            document.activeElement.blur();
            Object.assign(this.$data.form, this.$options.data().form);
            this.$validator.clean();
          }).catch((err) => {
            this.success = null;
            this.error = err;
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.menu {
  margin-bottom: 15px;
  background-color: rgb(255, 255, 255);
  list-style: none;
  border: 1px solid rgb(209, 213, 218);
  border-image: initial;

  .menu-heading {
    display: block;
    margin-top: 0;
    margin-bottom: 0;
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    color: rgb(88, 96, 105);
    background-color: rgb(243, 245, 248);
    padding: 8px 10px;
    border-bottom: 1px solid rgb(225, 228, 232);
  }

  .menu-item {
    position: relative;
    display: block;
    padding: 8px 10px;
    border-bottom: 1px solid rgb(225, 228, 232);
    user-select: none;

    a {
      color: rgb(3, 102, 214);
      text-decoration: none;
      background-color: transparent;
    }

    a:focus,
    a:active {
      text-decoration: none;
    }
  }

  .menu-item:hover {
    background-color: rgb(246, 248, 250);
    text-decoration: none;
  }

  .menu-item:active,
  .menu-item:focus {
    text-decoration: none;
  }

  .menu-item.selected::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    content: "";
    background-color: #15569f;
  }

  .menu-item.selected {
    font-weight: 600;
    color: rgb(36, 41, 46);
    cursor: default;
    background-color: rgb(255, 255, 255);
  }

  .menu-item:last-child {
    border-bottom-right-radius: 2px;
    border-bottom-left-radius: 2px;
    border-bottom: 0;
  }
}
</style>
