const introPage = document.getElementById('intro-page');
const gamePage = document.getElementById('game-page');
const startGameBtn = document.getElementById('start-game-btn');
const board = document.getElementById('board');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const statusDiv = document.getElementById('status');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');

const boardSize = 100;
let player1Position = 0;
let player2Position = 0;
let currentPlayer = 1;
let gameActive = true;
const diceRollHistory = [];

// Define las serpientes y escaleras (clave: inicio, valor: fin)
// Las nuevas posiciones cumplen con las reglas de no superposición y las reglas de movimiento de filas
const snakes = { 99: 54, 70: 32, 52: 13, 25: 2, 40: 3, 98: 69, 65: 22 };
const ladders = { 6: 28, 11: 38, 60: 85, 46: 72, 17: 49, 26: 59, 57: 89 };

// Función para inicializar el juego
function initializeGame() {
    // Esconde la página de inicio y muestra el juego
    introPage.style.display = 'none';
    gamePage.style.display = 'flex';

    // Crea el tablero de juego dinámicamente
    for (let i = 1; i <= boardSize; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.id = `square-${i}`;
        square.textContent = i;
        
        // Agrega iconos de serpientes o escaleras y estilos especiales
        if (snakes.hasOwnProperty(i)) {
            square.classList.add('snake');
            const icon = document.createElement('span');
            icon.classList.add('special-icon');
            icon.textContent = '🐍';
            square.appendChild(icon);
        }
        if (ladders.hasOwnProperty(i)) {
            square.classList.add('ladder');
            const icon = document.createElement('span');
            icon.classList.add('special-icon');
            icon.textContent = '🪜';
            square.appendChild(icon);
        }

        // Aplica un patrón de serpiente al diseño de la cuadrícula
        const row = Math.ceil(i / 10);
        const col = (row % 2 === 0) ? (11 - (i % 10 || 10)) : (i % 10 || 10);
        square.style.gridRowStart = 11 - row;
        square.style.gridColumnStart = col;
        board.appendChild(square);
    }

    // Crea las fichas de los jugadores
    const player1 = document.createElement('div');
    player1.id = 'player1';
    player1.classList.add('player');
    player1.textContent = '1';
    board.appendChild(player1);

    const player2 = document.createElement('div');
    player2.id = 'player2';
    player2.classList.add('player');
    player2.textContent = '2';
    board.appendChild(player2);

    const playerPositions = { 1: 0, 2: 0 };
    const playerElements = { 1: player1, 2: player2 };

    // Función para obtener las coordenadas del centro de una casilla
    function getSquareCenter(squareNumber) {
        const square = document.getElementById(`square-${squareNumber}`);
        if (square) {
            return {
                x: square.offsetLeft + square.offsetWidth / 2,
                y: square.offsetTop + square.offsetHeight / 2
            };
        }
        return null;
    }

    // Función para dibujar los caminos visuales de serpientes y escaleras
    function drawPaths() {
        // Elimina cualquier camino existente
        const existingPaths = document.querySelectorAll('.path');
        existingPaths.forEach(p => p.remove());

        // Dibuja los caminos de las serpientes
        for (const startSquare in snakes) {
            const endSquare = snakes[startSquare];
            const startCoords = getSquareCenter(startSquare);
            const endCoords = getSquareCenter(endSquare);
            if (startCoords && endCoords) {
                const path = document.createElement('div');
                path.classList.add('path', 'snake-path');
                const dx = endCoords.x - startCoords.x;
                const dy = endCoords.y - startCoords.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                path.style.width = `${distance}px`;
                path.style.transform = `rotate(${angle}deg)`;
                path.style.left = `${startCoords.x}px`;
                path.style.top = `${startCoords.y}px`;
                board.appendChild(path);
            }
        }

        // Dibuja los caminos de las escaleras
        for (const startSquare in ladders) {
            const endSquare = ladders[startSquare];
            const startCoords = getSquareCenter(startSquare);
            const endCoords = getSquareCenter(endSquare);
            if (startCoords && endCoords) {
                const path = document.createElement('div');
                path.classList.add('path', 'ladder-path');
                const dx = endCoords.x - startCoords.x;
                const dy = endCoords.y - startCoords.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                path.style.width = `${distance}px`;
                path.style.transform = `rotate(${angle}deg)`;
                path.style.left = `${startCoords.x}px`;
                path.style.top = `${startCoords.y}px`;
                board.appendChild(path);
            }
        }
    }

    // Función para obtener las coordenadas de una casilla específica
    function getSquareCoordinates(position) {
        const squareNumber = position + 1;
        const square = document.getElementById(`square-${squareNumber}`);
        if (square) {
            const center = getSquareCenter(squareNumber);
            const offset = playerElements[1].id === 'player1' ? -10 : 10;
            return {
                left: center.x + offset,
                top: center.y
            };
        }
        return null;
    }

    // Función para mover visualmente la ficha del jugador
    function movePlayerElement(player, position) {
        const coords = getSquareCoordinates(position);
        if (coords) {
            player.style.left = `${coords.left}px`;
            player.style.top = `${coords.top}px`;
        }
    }

    // Coloca las fichas de los jugadores al inicio
    movePlayerElement(player1, -1);
    movePlayerElement(player2, -1);
    drawPaths();

    // Listener de eventos para el botón de lanzar el dado
    rollDiceBtn.addEventListener('click', rollDice);

    // Función para el lanzamiento de dado
    async function rollDice() {
        if (!gameActive) return;
        rollDiceBtn.disabled = true;

        const diceAnimation = document.createElement('div');
        diceAnimation.classList.add('dice-animation');
        rollDiceBtn.appendChild(diceAnimation);
        diceAnimation.textContent = '🎲';

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        diceRollHistory.push(diceRoll);

        setTimeout(() => {
            diceAnimation.textContent = diceRoll;
            diceAnimation.classList.add('dice-result');
            diceAnimation.style.animation = 'none';

            setTimeout(() => {
                rollDiceBtn.removeChild(diceAnimation);
                movePlayer(currentPlayer, diceRoll);
            }, 1000);
        }, 1000);
    }

    // Función para mover al jugador
    function movePlayer(player, steps) {
        let currentPosition = playerPositions[player];
        let newPosition = currentPosition + steps;

        if (newPosition >= boardSize - 1) {
            newPosition = boardSize - 1;
            playerPositions[player] = newPosition;
            movePlayerElement(playerElements[player], newPosition);
            statusDiv.textContent = `¡Jugador ${player} ha ganado!`;
            gameActive = false;
            rollDiceBtn.disabled = true;
            return;
        }

        playerPositions[player] = newPosition;
        movePlayerElement(playerElements[player], newPosition);
        statusDiv.textContent = `Jugador ${player} avanzó a la casilla ${newPosition + 1}.`;

        setTimeout(() => {
            checkSnakesAndLadders(player, newPosition);
        }, 800);
    }

    // Función para verificar serpientes y escaleras
    function checkSnakesAndLadders(player, position) {
        const squareNumber = position + 1;
        if (snakes.hasOwnProperty(squareNumber)) {
            const newPosition = snakes[squareNumber] - 1;
            playerPositions[player] = newPosition;
            movePlayerElement(playerElements[player], newPosition);
            statusDiv.textContent += ` ¡Oh no, una serpiente! Desciende a la casilla ${newPosition + 1}.`;
        } else if (ladders.hasOwnProperty(squareNumber)) {
            const newPosition = ladders[squareNumber] - 1;
            playerPositions[player] = newPosition;
            movePlayerElement(playerElements[player], newPosition);
            statusDiv.textContent += ` ¡Encontró una escalera! Sube a la casilla ${newPosition + 1}.`;
        }
        switchTurn();
    }

    // Función para cambiar de turno
    function switchTurn() {
        if (!gameActive) return;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        statusDiv.textContent = `Es el turno del Jugador ${currentPlayer}`;
        rollDiceBtn.disabled = false;
    }
    
    // Función para agregar un mensaje al chat
    function addMessageToChat(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    }

    // Manejador de eventos para el formulario de chat
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessageToChat(userMessage, true);
        chatInput.value = '';

        try {
            const botResponse = await getBotResponse(userMessage);
            addMessageToChat(botResponse, false);
        } catch (error) {
            console.error('Error fetching bot response:', error);
            addMessageToChat('Lo siento, no pude procesar tu solicitud en este momento. Por favor, asegúrate de que tu clave de API sea válida y que la configuración del modelo sea correcta.', false);
        }
    });

    // Función para obtener la respuesta del bot de IA
    async function getBotResponse(userMessage) {
        const playerPosition = playerPositions[currentPlayer] + 1;
        const playerElement = playerElements[currentPlayer];
        
        // Determina el nombre del modelo de IA a usar. Si se proporciona uno, úsalo, de lo contrario, usa el predeterminado.
        const modelName = 'gemini-2.5-flash-preview-05-20';
        
        const context = `
            Eres un asistente de juego para un juego de Serpientes y Escaleras. Tu objetivo es ayudar al jugador.
            Las posiciones de los jugadores son:
            - Jugador 1: casilla ${playerPositions[1] + 1}
            - Jugador 2: casilla ${playerPositions[2] + 1}
            El turno es del Jugador ${currentPlayer}.
            El historial de lanzamientos de dados es: ${diceRollHistory.join(', ')}.
            Las serpientes están en: ${JSON.stringify(snakes)}. Las escaleras están en: ${JSON.stringify(ladders)}.
            Responde de manera concisa y útil, sin ser demasiado largo. Si la pregunta es sobre "llegar a una casilla", calcula el número exacto. Si es sobre "historial", lista los números. Si es sobre "probabilidad de ganar", da una estimación basada en la posición.
            Pregunta del jugador: "${userMessage}"
        `;

        const chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: context }] });
        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyAx8W6JNsoVcMWIOaPefKNBtJcBGyN8zIw";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error al llamar a la API:", errorData);
                throw new Error(errorData.error.message || `API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                return 'Lo siento, no pude entender tu pregunta.';
            }
        } catch (error) {
            console.error('Error with Gemini API:', error);
            return 'Hubo un error de comunicación con el asistente. Inténtalo de nuevo.';
        }
    }
}

// Inicia el juego cuando se hace clic en el botón
startGameBtn.addEventListener('click', initializeGame);
