const { GoogleGenerativeAI } = require('@google/generative-ai');
const cardsData = require('../assets/cards.json');
const config = require('../config/config');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

class TarotService {
  static getRandomCards(count) {
    const shuffled = [...cardsData.cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static generateTarotReadingPrompt(cards, isUprights) {
    const cardDetails = cards.map((card, index) => {
      const isUpright = isUprights[index];
      const meanings = card.meanings[isUpright ? 'light' : 'shadow'];
      const meaning = meanings[Math.floor(Math.random() * meanings.length)];
      return `${card.name} (${isUpright ? 'Upright' : 'Reversed'}): ${meaning}`;
    });

    return `
You are a skilled and intuitive tarot reader, deeply connected to the wisdom of the cards. A seeker has drawn three tarot cards, each representing a key moment in their journey:
  • Past: ${cardDetails[0]} – This card represents past influences, experiences, or lessons that have shaped the seeker's current path.
  • Present: ${cardDetails[1]} – This card reflects the seeker's current situation, energies, or challenges they are facing.
  • Future: ${cardDetails[2]} – This card offers insight into the direction they are heading, potential outcomes, or guidance for their next steps.

Analyze how these cards connect to tell a meaningful story. What themes emerge? How do past experiences shape the present, and what lessons from the present can guide the future? Provide an insightful and compassionate reading that offers clarity and constructive guidance. Write in a warm, conversational tone, as if speaking to a friend. Keep the response under 200 words, ensuring it is practical and uplifting.
    `;
  }

  static async getTarotReading(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  static async generateReading() {
    const drawnCards = this.getRandomCards(3);
    const isUprights = Array(3).fill().map(() => Math.random() >= 0.5);
    const prompt = this.generateTarotReadingPrompt(drawnCards, isUprights);
    const reading = await this.getTarotReading(prompt);
    return { cards: drawnCards, reading, isUprights };
  }

  static getAllCards() {
    return cardsData.cards;
  }
}

module.exports = TarotService; 