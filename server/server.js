const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cardsData = require('./assets/cards.json'); // Import your cards.json
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const YOUR_API_KEY = process.env.GEMINI_API;
const genAI = new GoogleGenerativeAI(YOUR_API_KEY);

function getRandomCards(cards, count) {
  const shuffled = cards.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateTarotReadingPrompt(cards, isUprights) {
  let cardDetails = cards.map((card, index) => {
    const isUpright = isUprights[index];
    const meaning =
      card.meanings[isUpright ? 'light' : 'shadow'][
        Math.floor(
          Math.random() * card.meanings[isUpright ? 'light' : 'shadow'].length
        )
      ];
    return `${card.name} (${isUpright ? 'Upright' : 'Reversed'}): ${meaning}`;
  });

  const prompt = `
    You are a wise and insightful tarot reader.
    Three cards have been drawn for a user, representing different aspects of their life.
    The cards are:
    1. ${cardDetails[0]}
    2. ${cardDetails[1]}
    3. ${cardDetails[2]}

    Please provide a detailed and thoughtful tarot reading, interpreting the meaning of each card in the context of the others.
    Consider how these aspects might relate to the user's current situation and offer guidance or insight.
    Focus on the positive and offer constructive advice. Please limit the response to 200 words.

  `;
  return prompt;
}

async function getTarotReading(prompt) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
  }); // Use the correct model name here
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

app.post('/api/tarot-reading', async (req, res) => {
  try {
    const drawnCards = getRandomCards(cardsData.cards, 3);
    const isUprights = [
      Math.random() >= 0.5,
      Math.random() >= 0.5,
      Math.random() >= 0.5,
    ]; // Determine upright/reversed for each card
    const prompt = generateTarotReadingPrompt(drawnCards, isUprights);
    const reading = await getTarotReading(prompt);
    res.json({ cards: drawnCards, reading: reading, isUprights: isUprights });
  } catch (error) {
    console.error('Error generating tarot reading:', error);
    res.status(500).json({ error: 'Failed to generate tarot reading.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
