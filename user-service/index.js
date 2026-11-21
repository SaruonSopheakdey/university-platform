require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

connectDB();

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    phone: String,
  },
  { strict: false, collection: 'users', timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildUserFilter(req) {
  const userId = req.headers['x-user-id'] || (req.query && req.query.id) || (req.body && req.body.id);
  const email = (
    req.headers['x-user-email'] ||
    (req.query && req.query.email) ||
    (req.body && req.body.email) ||
    ''
  ).trim();

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return { _id: new mongoose.Types.ObjectId(userId) };
  }
  if (email) {
    return { email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } };
  }
  return null;
}

app.get('/viewprofile', async (req, res) => {
  try {
    const filter = buildUserFilter(req);
    if (!filter) {
      return res.status(400).json({ message: 'User ID or email is required to view profile.' });
    }

    const user = await User.findOne(filter).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/updateprofile', async (req, res) => {
  try {
    const filter = buildUserFilter(req);
    if (!filter) {
      return res.status(400).json({ message: 'User ID or email is required to update profile.' });
    }

    const allowedUpdates = {};
    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      allowedUpdates.name = req.body.name.trim();
    }
    if (typeof req.body.phone === 'string' && req.body.phone.trim()) {
      allowedUpdates.phone = req.body.phone.trim();
    }
    if (typeof req.body.email === 'string' && req.body.email.trim()) {
      allowedUpdates.email = req.body.email.trim();
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update (name, phone, or email).' });
    }

    const updatedUser = await User.findOneAndUpdate(
      filter,
      { $set: allowedUpdates },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
