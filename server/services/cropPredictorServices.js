const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function cropPredictorServices(soil, altitude, temperature, humidiy, rainfall) {

  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt =
    `Predict the crops and give me data based on these environmental factors: Soil type: ${soil} Altitude (in km): ${altitude} Temperature (in degree Celsius): ${temperature} Humidity (in %): ${humidiy} Rainfall (in mm): ${rainfall} Note: Ensure the following conditions are met: - Altitude should be a numerical value between 0 and 10 (kilometers). - Temperature should be a numerical value between -50 and 50 (degree Celsius). - Humidity should be a numerical value between 0 and 100 (%). - Rainfall should be a numerical value between 0 and 1000 (mm). Ensure that the response contains text only no special characters like asterisks or your conversation in it only the information must be displayed`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    cleanText = text.replace(/\*/g, "");
    return cleanText;
}

module.exports = {
  cropPredictorServices,
};

