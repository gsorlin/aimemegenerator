const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Variable to store meme templates fetched from Memegen.link
let memeTemplates = [];

// Function to fetch meme templates from Memegen.link API
async function fetchMemeTemplates() {
    console.log('Fetching meme templates...');
    try {
        const response = await axios.get('https://api.memegen.link/templates');
        console.log('Meme templates fetched successfully. Full response:', response.data);
        memeTemplates = response.data;
        // If you want to print the full response to the console, including headers and other info:
        console.log('Full response object:', response);
    } catch (error) {
        console.error('Error fetching meme templates:', error);
    }
}

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to generate a meme
app.post('/generate-meme', async (req, res) => {
    const inputText = req.body.input;
    console.log('Received request to generate meme with input:', inputText);

    // Select ten random meme templates
    const selectedTemplates = [];
    for (let i = 0; i < 10; i++) {
        const randomTemplate = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
        selectedTemplates.push(randomTemplate);
    }
    console.log('Selected templates:', selectedTemplates.map(t => t.name).join(', '));

    // Construct the messages for ChatGPT
    const messages = [
        {
            role: 'system',
            content: 'You are a meme generator. Your task is to select the top 3 meme templates out of a given list of templates for a given topic, and then generate the meme caption text in JSON format for each. The JSON should include fields for \'templateName\', \'topCaption\', and \'bottomCaption\' for each template. Here is an example of the desired JSON format:' +
            '{\n' +
            '  "memes": [\n' +
            '    {\n' +
            '      "templateName": "Socially Awkward Penguin",\n' +
            '      "topCaption": "Asked cat if it wants to cuddle",\n' +
            '      "bottomCaption": "Cat runs away and hides"\n' +
            '    },\n' +
            '    {\n' +
            '      "templateName": "Y\'all Got Any More of Them",\n' +
            '      "topCaption": "When the cat sees you filling its food bowl",\n' +
            '      "bottomCaption": "Cat demanding more treats"\n' +
            '    },\n' +
            '    {\n' +
            '      "templateName": "Confession Bear",\n' +
            '      "topCaption": "I secretly love when the cat ignores me",\n' +
            '      "bottomCaption": "Because it makes the cuddle time more special"\n' +
            '    }\n' +
            '  ]\n' +
            '}'
        },
        {
            role: 'user',
            content: `For the topic '${inputText}', please choose the top 3 templates out of these options: ${selectedTemplates.map(t => t.name).join(', ')}, and provide captions for each in JSON format.`
        }
    ];

    // Call the ChatGPT API to generate the captions using JSON mode
    try {
        console.log('Sending request to ChatGPT API');
        const chatGptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo-1106",
            response_format: { "type": "json_object" },
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
    
        console.log('Response from ChatGPT received');
        if (chatGptResponse.data.choices && chatGptResponse.data.choices.length > 0) {
            const fullMessage = chatGptResponse.data.choices[0].message;
            console.log('Full ChatGPT message:', fullMessage);
    
            try {
                // Parse the content of fullMessage as JSON
                const contentJson = JSON.parse(fullMessage.content);
    
                // Check if memes array is not empty
                if (contentJson && contentJson.memes && contentJson.memes.length > 0) {
                    // Map the meme data to include the blank field
                    const memes = contentJson.memes.map(meme => {
                        const template = memeTemplates.find(t => t.name === meme.templateName);
                        return {
                            ...meme,
                            blank: template ? template.blank : undefined
                        };
                    });
    
                    console.log('Generated meme data:', memes);
                    res.json({ memes });
                } else {
                    console.error('Meme data is undefined or not in the expected format.');
                    res.status(500).send('Error: Meme data format is incorrect');
                }
            } catch (parseError) {
                console.error('Error parsing ChatGPT response content:', parseError);
                res.status(500).send('Error: Invalid format in ChatGPT response');
            }
        } else {
            console.error('No meme data generated.');
            res.status(500).send('Error generating meme');
        }
    } catch (error) {
        console.error('Error in ChatGPT API call:', error);
        res.status(500).send('Error generating meme');
    }
});

// Fetch meme templates when the server starts
fetchMemeTemplates();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});