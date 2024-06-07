const express = require("express");
require("dotenv").config();
const OpenAI = require("openai");
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

exports.create = async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).send({ error: "Prompt is required" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        res.send(response.choices[0].message.content);

    } catch (error) {
        console.error(
            "Error from OpenAI API:",
            error.response ? error.response.data : error.message
        );
        res
            .status(500)
            .send({ error: "An error occurred while processing your request." });
    }
};