const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');  // Import CORS middleware

const app = express();
const port = 5000;

// Enable CORS for all origins (or specify your frontend origin)
app.use(cors());  // This allows all origins
app.use(express.json());

// POST route to handle translation detection and request
app.post('/translate', async (req, res) => {
    const { text, targetLang } = req.body; // Get the text and target language from the request body
    console.log('Received request:', { text, targetLang });

    // Step 1: Detect the language of the input text using the Google Translate API
    const formData = new FormData();
    formData.append('q', text);  // Add text to detect its language

    const detectOptions = {
        method: 'POST',
        url: 'https://google-translate1.p.rapidapi.com/language/translate/v2/detect',
        headers: {
            'x-rapidapi-key': 'bda76843e2mshbadc00ec629eb05p15b239jsn048f7f88207c',
            'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
            'Accept-Encoding': 'application/gzip',
            ...formData.getHeaders(),
        },
        data: formData,
    };

    try {
        // Step 2: Send request to detect language
        const detectResponse = await axios.request(detectOptions);
        console.log('Language Detection Response:', detectResponse.data);

        const detectedLanguage = detectResponse.data.data.detections[0][0].language;
        console.log('Detected language:', detectedLanguage);

        // Step 3: Now translate the detected language to the target language
        const translateFormData = new FormData();
        translateFormData.append('q', text);
        translateFormData.append('target', targetLang);

        const translateOptions = {
            method: 'POST',
            url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
            headers: {
                'x-rapidapi-key': 'bda76843e2mshbadc00ec629eb05p15b239jsn048f7f88207c',
                'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
                'Accept-Encoding': 'application/gzip',
                ...translateFormData.getHeaders(),
            },
            data: translateFormData,
        };

        // Step 4: Send request to translate the text
        const translateResponse = await axios.request(translateOptions);
        console.log('Translation Response:', translateResponse.data);

        // Step 5: Send translated text back to the frontend
        res.json({ translatedText: translateResponse.data.data.translations[0].translatedText });
    } catch (error) {
        console.error('Error during language detection or translation:', error);

        // Check if error has a response (from API)
        if (error.response) {
            console.error('API error response:', error.response.data);
            res.status(500).json({ message: 'Translation API error', details: error.response.data });
        } else if (error.request) {
            console.error('API error request:', error.request);
            res.status(500).json({ message: 'No response from Translation API', details: error.request });
        } else {
            console.error('Error message:', error.message);
            res.status(500).json({ message: 'Unknown error during translation', details: error.message });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
