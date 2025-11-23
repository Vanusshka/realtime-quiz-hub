const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

const checkStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const students = await User.find({ userType: 'student' });

    console.log('\n📋 List of Students:');
    console.log('-------------------');
    
    if (students.length === 0) {
      console.log('No students found.');
    } else {
      students.forEach(student => {
        console.log(`Name: ${student.name}`);
        console.log(`Email: ${student.email}`);
        console.log(`Roll No: ${student.rollNo}`);
        console.log('-------------------');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkStudents();
