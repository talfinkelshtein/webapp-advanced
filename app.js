// Importing required modules
const express = require('express');
const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Another example route
app.get('/about', (req, res) => {
  res.send('About Us');
});

// POST request example
app.post('/data', (req, res) => {
  const { name, age } = req.body;
  res.json({ message: `Received data for ${name}, age ${age}` });
});

// Starting the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});