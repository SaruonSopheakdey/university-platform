const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri =
      'mongodb://saruonsopheakdey007_db_user:VzpjsSKPRJOydNMH@ac-7uytezt-shard-00-00.dvwjzil.mongodb.net:27017,ac-7uytezt-shard-00-01.dvwjzil.mongodb.net:27017,ac-7uytezt-shard-00-02.dvwjzil.mongodb.net:27017/student_management?tls=true&authSource=admin';

    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;