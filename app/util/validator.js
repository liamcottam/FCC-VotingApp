import Vue from 'vue';
import VeeValidate from 'vee-validate';

const lineNumberValidator = {
  getMessage(field, [params]) {
    return `${params} options are required`;
  },
  validate(value, [option]) {
    return new Promise((resolve) => {
      resolve({
        valid: value.split(/\r*\n/).filter(item => item.length >= 1).length >= option,
      });
    });
  },
};

VeeValidate.Validator.extend('lineMin', lineNumberValidator);
Vue.use(VeeValidate, { enableAutoClasses: true });
