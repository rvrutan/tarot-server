const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes/routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});