import axios, { AxiosError } from 'axios';


interface DeepSeekMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface DeepSeekResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

class QnADeepSeekGenerator {
    private DEEPSEEK_API_KEY = 'sk-d8088cbc82a046ccbf22716dd1c74af1';
    private API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';


    async generateBot(content: any): Promise<string | null> {

        const prompt = `
                TASK: Convert website content into Botpress QnA JSON format.

                ANALYZE this content and create Question-Answer pairs where:
                - Questions are what real users would ask about this service/company
                - Answers are concise (1-3 sentences) and come directly from the content
                - Each QnA pair has 2-3 question variations
                - Focus on: main services, benefits, eligibility, process, requirements

                CRITICAL RULES:
                1. NEVER create questions that are just answer fragments
                2. Questions must make sense as standalone queries
                3. Answers must be factual from the content
                4. Generate 8-12 QnA pairs total

                REQUIRED JSON FORMAT:
                {
                "qnas": [
                    {
                    "id": "random10chars_topic",
                    "data": {
                        "action": "text",
                        "contexts": ["global"],
                        "enabled": true,
                        "answers": {"en": ["Answer text"]},
                        "questions": {"en": ["Q1?", "Q2?", "Q3?"]},
                        "redirectFlow": "",
                        "redirectNode": ""
                    }
                    }
                ],
                "contentElements": []
                }

                CONTENT:
                {website_content}

                OUTPUT ONLY JSON:`;

        try {
            const response = await axios.post<DeepSeekResponse>(
                this.API_ENDPOINT,
                {
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'user',
                            content: `${prompt.replace('{website_content}', content)}`

                        } as DeepSeekMessage
                    ],
                    temperature: 0.7
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.DEEPSEEK_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 3. Parse API response
            const aiResponse = response.data.choices[0].message.content;
            console.log('AI response generated:', aiResponse);

            return aiResponse;
        } catch (error) {
            // Type guard for AxiosError
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error('DeepSeek API Error:', {
                    status: axiosError.response?.status,
                    statusText: axiosError.response?.statusText,
                    data: axiosError.response?.data,
                    message: axiosError.message
                });
            } else if (error instanceof Error) {
                console.error('Error generating bot:', error.message);
            } else {
                console.error('Unknown error:', error);
            }

            return null;
        }
    }
}

export default QnADeepSeekGenerator;