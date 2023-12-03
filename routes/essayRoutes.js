const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate', async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.status(400).json({ message: 'No prompt provided' });
    }

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            max_tokens: 100,
        });
        //console.log("API Response:", JSON.stringify(chatCompletion, null, 2));
        const generatedText = chatCompletion.choices[0].message.content;
        res.json({ essay: generatedText });

    } catch (error) {
        console.error("Error during OpenAI API call:", error);
        res.status(500).json({ message: 'Error generating essay' });
    }
});

module.exports = router;
