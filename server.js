const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Reemplaza con tus credenciales de la API de IA (ej. Gemini API)
const GEMINI_API_KEY = 'TU_API_KEY_AQUÍ';
const GEMINI_API_URL = 'URL_DE_TU_API_AQUÍ'; 

app.post('/api/roll-dice-ai', async (req, res) => {
    const { player1Position, player2Position } = req.body;

    try {
        // Construye el prompt para la IA
        const prompt = `Actúa como un jugador de un juego de mesa. Tu objetivo es alcanzar la casilla 25. Tú estás en la casilla ${player2Position} y tu oponente está en la casilla ${player1Position}. Necesitas decidir cuántas casillas moverte, pero solo puedes moverte entre 1 y 6 casillas. ¿Qué número de pasos te daría una mejor oportunidad de ganar? Responde solo con un número entre 1 y 6. No incluyas explicaciones.`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GEMINI_API_KEY}` // Esto puede variar según la API
            },
            body: JSON.stringify({
                // La estructura del cuerpo depende de la API, este es un ejemplo
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        let aiDecision = data.candidates[0].content.parts[0].text;
        
        // Limpia la respuesta para asegurarte de que sea solo un número
        let diceRoll = parseInt(aiDecision.trim().match(/\d/)[0], 10);
        if (isNaN(diceRoll) || diceRoll < 1 || diceRoll > 6) {
            diceRoll = Math.floor(Math.random() * 6) + 1;
        }

        res.json({ diceRoll });

    } catch (error) {
        console.error('Error al llamar a la API de IA:', error);
        // Si hay un error, la IA lanzará un dado al azar para no romper el juego
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        res.status(500).json({ diceRoll, error: 'Error al procesar la solicitud de la IA.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});