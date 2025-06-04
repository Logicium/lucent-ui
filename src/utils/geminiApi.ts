import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate an article based on commit details using Google Gemini API
 * @param commitDetails - Object containing commit details
 * @returns Promise<string> - The generated article content
 */
export async function generateArticleWithGemini(commitDetails: any): Promise<string> {
  try {
    // Make sure API key is available
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the prompt with commit details
    const prompt = `
      Generate a comprehensive how-to article based on the following commit details:

      Commit Message: ${commitDetails.message}
      Author: ${commitDetails.authorName || 'Unknown'} (${commitDetails.authorEmail || 'No email'})
      Date: ${new Date(commitDetails.date).toLocaleString()}
      Commit SHA: ${commitDetails.sha}

      ${commitDetails.fileChanges ? `Files changed: ${JSON.stringify(commitDetails.fileChanges, null, 2)}` : ''}

      The article should:
      1. Have a clear title based on the commit message
      2. Explain the purpose of the changes
      3. Provide step-by-step instructions on how to implement similar changes
      4. Include code examples where relevant
      5. Explain any potential impacts or considerations
      6. Use markdown formatting for better readability

      Format the article in markdown.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating article with Gemini:', error);
    throw new Error(`Failed to generate article: ${error.message}`);
  }
}
