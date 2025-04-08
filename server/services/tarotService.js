const { GoogleGenerativeAI } = require('@google/generative-ai');
const cardsData = require('../assets/cards.json');
const config = require('../config/config');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

class TarotService {
  static getRandomCards(count) {
    const shuffled = [...cardsData.cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static generateTarotReadingPrompt(
    cards,
    isUprights,
    selectedQuestion,
    selectedReader
  ) {
    const cardDetails = cards.map((card, index) => {
      const isUpright = isUprights[index];
      const meanings = card.meanings[isUpright ? 'light' : 'shadow'];
      const meaning = meanings[Math.floor(Math.random() * meanings.length)];
      return `${card.name} (${isUpright ? 'Upright' : 'Reversed'}): ${meaning}`;
    });

    // Map reader names to custom "flavor" instructions for the prompt
    const ReaderPrompts = {
      Josh: 'Adopt an intuitive tone with a poetic approach.',
      Roni: 'Include analytical insights balanced with light humor.',
      Ryan: "Pretend like you know what you're doing, and fumble your way through. Make it comical and relevant to the reader.",
      Tim: "You are from medieval time era. Use medieval-era motifs and an emphasis on academic knowledge. Make if funny and relevant to the reader. Vary your intro to the reader so its not always hark. Be distracted as if you hear someone outside the window. Have the reader wait while you check the danger. There's nothing ever there. Don't let the reader know that you sell timeshares on the side. Maybe hint that Florida is nice this time of year. Oh it's hurricane season. Feel free to exceed the word limit to 250",
    };

    // Incorporate question-specific context; for example:
    const questionContext = {
      'Love Life':
        'Focus on relationships, emotions, and deep personal connections.',
      School:
        'Look at academic challenges, learning opportunities, and social dynamics.',
      Career:
        'Reflect on professional growth, ambition, and potential challenges in the workplace.',
      Friends:
        'Consider social influences, community, and interpersonal dynamics.',
      'General Reading':
        'Offer a holistic overview with balanced insights and guidance.',
    };

    return `
  You are a skilled and intuitive tarot reader, deeply connected to the wisdom of the cards.
  A seeker has drawn three tarot cards, each representing a key moment in their journey:
    • Past: ${
      cardDetails[0]
    } – This card represents past influences and lessons.
    • Present: ${
      cardDetails[1]
    } – This card reflects the current situation, energies, and challenges.
    • Future: ${
      cardDetails[2]
    } – This card offers insight into what may come and guidance for next steps.
  The seeker is specifically asking about ${selectedQuestion.toLowerCase()}. ${
      questionContext[selectedQuestion] || ''
    }
  Additionally, please incorporate the following style note as suggested by ${selectedReader}: ${
      ReaderPrompts[selectedReader] || ''
    }
  Analyze how these cards connect to tell a meaningful story. What themes emerge? How do past experiences shape the present, and what lessons from the present can guide the future? Provide an insightful reading that offers clarity and constructive guidance. Write in a somewhat poetic style, and keep the response under 200 words. Provide the response in plain text with no Markdown formatting or emphasis characters.
    `;
  }

  static async getTarotReading(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  static async generateCustomReading(selectedQuestion, selectedReader) {
    const drawnCards = TarotService.getRandomCards(3);
    const isUprights = Array(3)
      .fill()
      .map(() => Math.random() >= 0.5);
    // Pass additional context to your prompt generator:
    const prompt = TarotService.generateTarotReadingPrompt(
      drawnCards,
      isUprights,
      selectedQuestion,
      selectedReader
    );
    const reading = await TarotService.getTarotReading(prompt);
    return { cards: drawnCards, reading, isUprights };
  }

  static getAllCards() {
    return cardsData.cards;
  }
}

module.exports = TarotService;
