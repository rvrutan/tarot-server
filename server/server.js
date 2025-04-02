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
You are a skilled and intuitive tarot reader, deeply connected to the wisdom of the cards. A seeker has drawn three tarot cards, each representing a key moment in their journey:
	•	Past: ${cardDetails[0]} – This card represents past influences, experiences, or lessons that have shaped the seeker’s current path.
	•	Present: ${cardDetails[1]} – This card reflects the seeker’s current situation, energies, or challenges they are facing.
	•	Future: ${cardDetails[2]} – This card offers insight into the direction they are heading, potential outcomes, or guidance for their next steps.

Analyze how these cards connect to tell a meaningful story. What themes emerge? How do past experiences shape the present, and what lessons from the present can guide the future? Provide an insightful and compassionate reading that offers clarity and constructive guidance. Write in a warm, conversational tone, as if speaking to a friend. Keep the response under 200 words, ensuring it is practical and uplifting.
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
