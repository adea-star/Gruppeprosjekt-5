// Spill variabler
const stressFill = document.getElementById('stressFill'); // Element for å vise stressnivå
const gameCanvas = document.getElementById('gameCanvas'); // Canvas der spillknapper dukker opp
const startScreen = document.getElementById('start-screen'); // Startskjerm for spillet
const endScreen = document.getElementById('end-screen'); // Sluttskjerm når spillet er over
const retryButton = document.getElementById('retryButton'); // Knapp for å prøve spillet på nytt
const nextPageLink = document.getElementById('nextPageLink'); // Link til neste side etter spillet
let stressLevel = 0; // Startverdi for stressnivå
let gameActive = false; // Angir om spillet er aktivt
let timeRemaining = 60; // Spilletid i sekunder
let spawnRate, stressIncreaseRate, stressReduction; // Variabler for spillbalanse

// Valg settings
const difficultySettings = {
    choice1: {
        spawnRate: 1500,  // Hvor fort knappene spawner for valg 1
        stressIncreaseRate: 1,  // Økning i stressnivå for valg 1
        stressReduction: 15  // Reduksjon av stressnivå per klikk for valg 1
    },
    choice2: {
        spawnRate: 1500,  // Hvor fort knappene spawner for valg 2
        stressIncreaseRate: 0.5,  // Økning i stressnivå for valg 2
        stressReduction: 15  // Reduksjon av stressnivå per klikk for valg 2
    },
};

// Event listeners for vanskelighetsvalg
document.getElementById('choice1').addEventListener('click', function() {
    setDifficulty('choice1'); // Setter vanskelighetsgrad til valg 1
});
document.getElementById('choice2').addEventListener('click', function() {
    setDifficulty('choice2'); // Setter vanskelighetsgrad til valg 2
});

// Funksjon for å sette vanskelighetsgrad og starte spillet
function setDifficulty(choice) {
    spawnRate = difficultySettings[choice].spawnRate; // Setter spawnrate basert på valg
    stressIncreaseRate = difficultySettings[choice].stressIncreaseRate; // Setter stressøkning basert på valg
    stressReduction = difficultySettings[choice].stressReduction; // Setter stressreduksjon basert på valg
    
    document.querySelector('.difficulty-options').style.display = 'none'; // Skjuler vanskelighetsknapper og viser spillcanvas

    startGame(); // Starter spillet etter valg av vanskelighetsgrad
}

// Funksjon for å spawne en knapp på en tilfeldig posisjon
function spawnButton() {
    if (!gameActive) return;

    const button = document.createElement('button'); // Oppretter knapp
    button.classList.add('popup-button'); // Legger til stil for popup-knapp
    
    const x = Math.random() * (gameCanvas.clientWidth - 30); // Tilfeldig x-posisjon
    const y = Math.random() * (gameCanvas.clientHeight - 30); // Tilfeldig y-posisjon
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;

    button.onclick = () => {
        stressLevel = Math.max(stressLevel - stressReduction, 0); // Reduserer stress
        updateStressBar();
        gameCanvas.removeChild(button); // Fjerner knapp etter klikk
    };

    gameCanvas.appendChild(button); // Legger knapp til canvas
    setTimeout(() => {
        if (button.parentNode === gameCanvas) {
            gameCanvas.removeChild(button); // Fjerner knapp etter 1,5 sekunder
        }
    }, 1500); 
}

// Funksjon for å oppdatere stressbaren
function updateStressBar() {
    stressFill.style.width = `${stressLevel}%`; // Oppdaterer bredden på stressbaren
    
    if (stressLevel >= 100) { // Hvis stressnivået når 100 %, avslutt spillet
        endGame('lose');
    }
}

// Funksjon for å starte spillet
function startGame() {
    gameCanvas.style.display = 'block'; // Viser spillcanvas
    startScreen.style.display = 'none'; // Skjuler startskjermen
    document.getElementById('stressbarcontainer').style.display = 'block'; // Viser stressbar

    gameActive = true;
    stressLevel = 0; // Nullstiller stressnivået
    updateStressBar(); // Oppdaterer baren til å vise startnivået

    const stressInterval = setInterval(() => {
        if (gameActive) {
            stressLevel = Math.min(stressLevel + stressIncreaseRate, 100); // Øker stressnivået gradvis
            updateStressBar();
        }
    }, 100); // Øker stress hvert 100 ms

    const buttonSpawnInterval = setInterval(() => {
        if (gameActive) {
            spawnButton();
        }
    }, spawnRate); // Spawner knapper basert på spawnrate

    const countdownInterval = setInterval(() => {
        if (gameActive) {
            timeRemaining -= 1; // Reduserer gjenværende tid
            if (timeRemaining <= 0) {
                endGame('win'); // Avslutter spillet med seier hvis tiden går ut
                clearInterval(countdownInterval); // Stopper nedtellingen
            }
        }
    }, 1000); // Oppdaterer hvert sekund
}

// Funksjon for å avslutte spillet
function endGame(result) {
    gameActive = false;
    gameCanvas.style.display = 'none'; // Skjuler spillcanvas
    document.getElementById('stressbarcontainer').style.display = 'none'; // Skjuler stressbar
    endScreen.style.display = 'flex'; // Viser sluttskjermen
    
    if (result === 'lose') {
        document.getElementById('end-message').textContent = 'Du strøk! Stresset ble for mye og du er nødt til å ta eksamen om igjen.';
        retryButton.style.display = 'block'; // Viser prøv-igjen-knappen
        nextPageLink.style.display = 'none'; // Skjuler neste side-link
        retryButton.onclick = () => location.reload(); // Laster inn siden på nytt for å prøve igjen
    } else if (result === 'win') {
        document.getElementById('end-message').textContent = 'Du besto! Gratulerer!';
        retryButton.style.display = 'none'; // Skjuler prøv-igjen-knappen
        nextPageLink.style.display = 'block'; // Viser neste side-link
        nextPageLink.href = 'nextPage.html'; // Linker til neste side
    }
}
