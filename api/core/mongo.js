const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true, })
  .then(() => console.log('Connected to database'))
  .catch(err => {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1);
  });