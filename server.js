const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Stockage en mémoire
let users = [];
let exercises = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const user = { username, _id: uuidv4() };
  users.push(user);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const { description, duration, date } = req.body;
  if (!description || !duration) return res.status(400).json({ error: 'Missing fields' });

  const exercise = {
    _id: userId,
    username: user.username,
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  exercises.push({ ...exercise, userId });
  res.json(exercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  if (!user) return res.status(400).json({ error: 'User not found' });

  let log = exercises.filter(e => e._id === userId);

  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: userId,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});