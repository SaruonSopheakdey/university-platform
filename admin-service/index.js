const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5003;

connectDB();

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Search user by name or email
app.get('/searchuser', async (req, res) => {
  try {
    const email = (req.query.email || '').trim();
    const name = (req.query.name || '').trim();
    const queryTerm = (req.query.q || '').trim();

    let filter = {};
    if (email) {
      filter = { email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } };
    } else if (name) {
      filter = { name: { $regex: escapeRegex(name), $options: 'i' } };
    } else if (queryTerm) {
      filter = {
        $or: [
          { email: { $regex: escapeRegex(queryTerm), $options: 'i' } },
          { name: { $regex: escapeRegex(queryTerm), $options: 'i' } },
        ],
      };
    } else {
      return res.status(400).json({ message: 'Provide name or email query parameter.' });
    }

    const users = await User.find(filter).select('-password');
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// View all users
app.get('/viewalluser', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user by email
app.delete('/deluser', async (req, res) => {
  try {
    const email = ((req.body && req.body.email) || req.query.email || '').trim();
    if (!email) {
      return res.status(400).json({ message: 'Email is required to delete a user.' });
    }

    const deleted = await User.findOneAndDelete({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User deleted successfully.',
      deletedUser: { id: deleted._id, email: deleted.email, name: deleted.name },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});