const mongoose = require('mongoose');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://saruonsopheakdey007_db_user:VzpjsSKPRJOydNMH@ac-7uytezt-shard-00-00.dvwjzil.mongodb.net:27017,ac-7uytezt-shard-00-01.dvwjzil.mongodb.net:27017,ac-7uytezt-shard-00-02.dvwjzil.mongodb.net:27017/student_management?ssl=true&replicaSet=atlas-lwp3py-shard-0&authSource=admin';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
