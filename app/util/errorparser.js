export default {
  parse(error) {
    if (error.response.data) {
      return error.response.data;
    }
    return { msg: `Unhandled Error: ${error.response.status} - ${error.response.statusText}` };
  },
};
