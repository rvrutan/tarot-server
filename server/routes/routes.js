//testing 

// routes/cards.js
const express = require('express');
const router = express.Router();
const TarotService = require('../services/tarotService');

// Get a random card
router.get('/cards/random', (req, res, next) => {
  try {
    const cards = TarotService.getAllCards();
    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomCard = cards[randomIndex];
    res.json(randomCard);
  } catch (error) {
    next(error);
  }
});

// Get all cards
router.get('/all-cards', (req, res, next) => {
  try {
    const cards = TarotService.getAllCards();
    res.json({ cards }); 
  } catch (error) {
    next(error);
  }
});

// Generate a tarot reading
router.post('/tarot-reading', async (req, res, next) => {
  try {
    const reading = await TarotService.generateReading();
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

module.exports = router;