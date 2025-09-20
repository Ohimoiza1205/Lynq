import axios from 'axios';

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!;
  }

  async generateTags(title: string, description: string): Promise<{ tags: string[], confidence: number }> {
    try {
      const prompt = `Analyze this medical video and extract relevant tags. 
      Title: ${title}
      Description: ${description}
      
      Return only medical procedure tags like: oncology, neurosurgery, orthopedics, cardiology, etc.
      Format: tag1,tag2,tag3`;

      const response = await axios.post(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      const tags = generatedText.split(',').map((tag: string) => tag.trim());
      
      return { tags, confidence: 0.8 };
    } catch (error) {
      console.error('Gemini tagging error:', error);
      return { tags: [], confidence: 0 };
    }
  }

  async answerQuestion(context: string, question: string): Promise<string> {
    try {
      const prompt = `Answer the question based ONLY on the provided context. Cite timestamps when available.
      
      Context: ${context}
      Question: ${question}
      
      Answer:`;

      const response = await axios.post(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Q&A error:', error);
      return 'Sorry, I could not process your question.';
    }
  }

  async generateQuizQuestions(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini quiz generation error:', error);
      throw error;
    }
  }
}