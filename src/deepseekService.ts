import axios from 'axios';

const API_URL = '/api/openrouter';

export const getEnhancedMemory = async (description: string) => {
  try {
    console.log('Calling secure API for enhanced memory:', description);
    
    const response = await axios.post(API_URL, {
      description: description
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API response received:', response.data);
    
    return {
      poetic_narrative: response.data.poetic_narrative,
      art_instructions: response.data.art_instructions
    };
  } catch (error: any) {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 402) {
      throw new Error('OpenRouter API billing issue. Please check your API key and billing status at https://openrouter.ai/');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid OpenRouter API key. Please check your server configuration.');
    } else if (error.response?.status === 429) {
      throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`API error: ${error.response?.data?.error || error.message}`);
    }
  }
};