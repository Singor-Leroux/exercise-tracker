const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const users = []; // { _id, username, log: [{description, duration, date}] }

// 1. Create user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { _id: nanoid(), username, log: [] };
  users.push(newUser);
  res.json({ _id: newUser._id, username: newUser.username });
});

// 2. Get all users
app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ _id: u._id, username: u.username })));
});

// 3. Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const exercise = {
    description,
    duration: Number(duration),
    date: date ? new Date(date) : new Date()
  };

  user.log.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  });
});

// 4. Get logs
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let log = [...user.log];

  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(entry => entry.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(entry => entry.date <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log.map(entry => ({
      description: entry.description,
      duration: entry.duration,
      date: entry.date.toDateString()
    }))
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
