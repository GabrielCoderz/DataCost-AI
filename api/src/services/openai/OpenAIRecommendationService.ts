import OpenAI from 'openai';

interface ChatRequest {
  prompt: string;
  systemMessage?: string;
}

class OpenAIRecommendationService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async execute(prompt: string) {
    if (!prompt) throw new Error('Prompt é obrigatório');

    return await this.run(prompt);
  }

  private async run(prompt: string) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um arquiteto de soluções especialista em AWS.',
          },
          {
            role: 'user',
            content: `${JSON.stringify(prompt)}`
          },
        ],
        temperature: 0.4,
        max_tokens: 700,
      });

      console.log(response.choices[0])

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao chamar API do ChatGPT:', error);
      throw new Error('Erro ao gerar recomendação com IA');
    }
  }
}

export { OpenAIRecommendationService };
