// Game variables
const stressFill = document.getElementById('stressFill');
const gameCanvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');
const retryButton = document.getElementById('retryButton');
const nextPageLink = document.getElementById('nextPageLink');
let stressLevel = 0;
let gameActive = false;
let timeRemaining = 60; // Game duration
let spawnRate, stressIncreaseRate, stressReduction;

// Difficulty settings
const difficultySettings = {
    choice1: {
        spawnRate: 1500,  // Faster spawn rate (harder)
        stressIncreaseRate: 1,  // Faster stress increase
        stressReduction: 15  // Less stress reduction per button click
    },
    choice2: {
        spawnRate: 1500,  // Slower spawn rate (easier)
        stressIncreaseRate: 0.5,  // Slower stress increase
        stressReduction: 15  // More stress reduction per button click
    }
};

// Event listeners for difficulty selection
document.getElementById('choice1').addEventListener('click', function() {
    setDifficulty('choice1');
});
document.getElementById('choice2').addEventListener('click', function() {
    setDifficulty('choice2');
});

// Function to set difficulty and start the game immediately
function setDifficulty(choice) {
    spawnRate = difficultySettings[choice].spawnRate;
    stressIncreaseRate = difficultySettings[choice].stressIncreaseRate;
    stressReduction = difficultySettings[choice].stressReduction;
    
    // Hide difficulty buttons and show the game canvas
    document.querySelector('.difficulty-options').style.display = 'none'; 

    // Start the game immediately after selecting difficulty
    startGame();
}

// Function to spawn a button at a random location
function spawnButton() {
    if (!gameActive) return;

    const button = document.createElement('button');
    button.classList.add('popup-button');
    
    // Randomize button position
    const x = Math.random() * (gameCanvas.clientWidth - 30);
    const y = Math.random() * (gameCanvas.clientHeight - 30);
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;

    // Add click event to reduce stress
    button.onclick = () => {
        stressLevel = Math.max(stressLevel - stressReduction, 0); // Reduce stress
        updateStressBar();
        gameCanvas.removeChild(button); // Remove button after click
    };

    // Add button to the canvas and set timeout to remove it
    gameCanvas.appendChild(button);
    setTimeout(() => {
        if (button.parentNode === gameCanvas) {
            gameCanvas.removeChild(button);
        }
    }, 1500); // Button lasts for 1.5 seconds
}

// Function to update the stress bar
function updateStressBar() {
    stressFill.style.width = `${stressLevel}%`;
    
    // If stress level reaches 100%, end the game
    if (stressLevel >= 100) {
        endGame('lose');
    }
}

// Function to start the game
function startGame() {
    gameCanvas.style.display = 'block';
    startScreen.style.display = 'none';
    document.getElementById('stressbarcontainer').style.display = 'block';

    // Timer to spawn buttons and increase stress
    gameActive = true;
    stressLevel = 0; // Reset stress level
    updateStressBar(); // Update bar to reflect initial stress level (0)

    // Start the stress increase interval
    const stressInterval = setInterval(() => {
        if (gameActive) {
            stressLevel = Math.min(stressLevel + stressIncreaseRate, 100); // Gradually increase stress
            updateStressBar();
        }
    }, 100); // Increase stress every 100ms

    // Start the button spawn interval
    const buttonSpawnInterval = setInterval(() => {
        if (gameActive) {
            spawnButton();
        }
    }, spawnRate); // Spawn buttons based on the selected spawn rate
        // Countdown timer for game duration
        const countdownInterval = setInterval(() => {
            if (gameActive) {
                timeRemaining -= 1; // Decrease the time
                if (timeRemaining <= 0) {
                    endGame('win'); // End game with win if time runs out
                    clearInterval(countdownInterval); // Stop the countdown
                }
            }
        }, 1000); // Update every second
}


// Function to end the game
function endGame(result) {
    gameActive = false;
    gameCanvas.style.display = 'none';
    document.getElementById('stressbarcontainer').style.display = 'none';
    endScreen.style.display = 'flex';
    
    if (result === 'lose') {
        document.getElementById('end-message').textContent = 'Du strøk! Stresset ble for mye og du er nødt til å ta eksamen om igjen.';
        retryButton.style.display = 'block';
        nextPageLink.style.display = 'none';
        retryButton.onclick = () => location.reload(); // Reload the page to retry
    } else if (result === 'win') {
        document.getElementById('end-message').textContent = 'Du besto! Gratulerer!';
        retryButton.style.display = 'none';
        nextPageLink.style.display = 'block';
        nextPageLink.href = 'nextPage.html'; // Link to the next page
    }
}
