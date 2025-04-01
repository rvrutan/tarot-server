const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // Allow requests from the client

// Serve static files
app.use(express.static('assets'));

// API route to get tarot cards
app.get('/api/cards', (req, res) => {
  res.sendFile(__dirname + '/assets/cards.json');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});