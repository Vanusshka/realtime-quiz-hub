require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const modelNames = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one sentence');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ Success with ${modelName}!`);
        console.log('Response:', text);
        return;
      } catch (err) {
        console.log(`❌ ${modelName} failed:`, err.message);
      }
    }
    
    throw new Error('All models failed');
  } catch (error) {
    console.error('\n❌ Final Error:', error.message);
  }
}

async function oldTest() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Testing Gemini API...');
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Gemini responded:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Status:', error.status);
  }
}

testGemini();
