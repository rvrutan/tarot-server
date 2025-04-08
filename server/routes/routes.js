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

router.post('/tarot-reading', async (req, res, next) => {
  try {
    // Destructure the new values from req.body here (where req is defined)
    const { selectedQuestion, selectedReader } = req.body;
    const drawnCards = TarotService.getRandomCards(3);
    const isUprights = Array(3)
      .fill()
      .map(() => Math.random() >= 0.5);

    // Generate the prompt using the received parameters
    const prompt = TarotService.generateTarotReadingPrompt(
      drawnCards,
      isUprights,
      selectedQuestion,
      selectedReader
    );

    // Use the prompt to get a tarot reading
    const reading = await TarotService.getTarotReading(prompt);
    res.json({ cards: drawnCards, reading, isUprights });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
