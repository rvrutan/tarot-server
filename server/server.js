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
    You are a skilled and intuitive tarot reader, deeply connected to the wisdom of the cards. A seeker has drawn three tarot cards, each representing a key aspect of their journey. Your task is to provide a thoughtful and immersive reading that resonates with their current life situation. The cards drawn are as follows:
	1.	${cardDetails[0]}
	2.	${cardDetails[1]}
	3.	${cardDetails[2]}

Analyze how these cards interact with one another and what story they tell when combined. How do they reflect the past, present, and future? What deeper themes or energies are at play? Provide a compassionate and insightful reading that offers clarity, encouragement, and constructive advice. Focus on practical guidance the seeker can apply in their life. Keep the response under 200 words and write in a warm, conversational tone, as if speaking to a friend who has just asked for a reading.

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
