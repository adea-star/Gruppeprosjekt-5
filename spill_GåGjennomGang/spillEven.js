//henter canvas
const game = document.getElementById("gameCanvas");
const ctx = game.getContext("2d");

//henter start-knapp og bestemmer funksjon som skal kjøre når den trykkes på
const startButton = document.getElementById("startSpill");
startButton.addEventListener("click", startGame);

//henter body id
const body = document.getElementById("body");

//lagrer bredde og høyde for canvas som const
const canvasWidth = 800;
const canvasHeight = 500;

//setter startposisjoner og størrelse på figur
let posX = 50;
let posY = 225;
let sizeX = 50;
let sizeY = 75;

// lager variabeler for score
let score = 0;
let scoreBooks = 0; // denne variablen skal øke når man samler bøker
let scoreScreen = 0; // denne som skrives til canvas og sjekker om spillet er vunnet

// setter variable for liv
let lives = 5;

// lager en variabel for å sjekke om spillet allerede er aktivt
let gameActive = false;
// lager en variabel for å pause loopen
let paused = false;

// array for verdiene til andre studenter og bøker
const studentsArray = [];
const booksArray = [];

//Object for å følge med på tastetrykk
const keys = {};
// Event listeners for alle taster som trykkes
document.addEventListener("keydown", function (event) {
    keys[event.code] = true; // registrerer at knapp trykkes ned
});
document.addEventListener("keyup", function (event) {
    keys[event.code] = false; // registrerer at en knapp slippes opp igjen
});

// setter inngangsverdier for bakgrunnsbilde
const backgroundImage = new Image();
backgroundImage.src = "spillBakgrunn.jpg"; // sti til bildet
let backgroundX = 0; // setter start x-posisjon for bildet
const backgroundSpeed = 2; // setter farten ttil bakgrunnen til 2 (samme som bøkene)

// lagrer bildefil for figur
const playerImage = new Image();
playerImage.src = "Spiller.png";

// lagrer bildefil for bok
const bookImage = new Image();
bookImage.src = "bok.png";

// lagrer bildefil for andre studenter
const studentImage = new Image();
studentImage.src = "student.png";

//lager restart knapp
const restartButton = document.createElement("button");
restartButton.innerText = "Restart";
restartButton.classList = "button"; // gir knappen samme class som start-knapp



// lager en class constructor som generer tilfeldig posisjon og fart for studenter
class Students {
    constructor(){ //constructor funksjonen er en forhåndsdefinert funksjon i js og er obligatorisk i en class
        this.x = Math.random() * 18000 + 400; //startposisjon x mellom 400 og omtrent 18 000
        this.y = Math.random() * 400 + 75; // y posisjon mellom 1 og 400 (400 fordi figurene er 50px høye og veggen i bakgrunn er ca. 100px)
        this.speed = Math.random() * 2 + 1.5; // tilfeldig fart mellom 2 og 4 px
    }
    updateStudents() {
        this.x -= this.speed; // funksjon som oppdaterer x-posisjon ved å trekke fra farten(bevegelse mot venstre)
    }
    drawStudents() {
        ctx.fillStyle = "rgba(0,0,0,0)"; // usynlig farge, kan brukes for å enkelt visualisere hitbox på de forskjellige studentene
        ctx.fillRect(this.x, this.y, 50, 50); // tegner figurene
        ctx.drawImage(studentImage, this.x, this.y, 50, 70); // tegner studentene med bilde
    }
}
// funksjon som lagrer x, y og speed i et array
//pusher 150 sett med (x, y, speed) verdier inn i array
function addStudents(){
    for (let i = 0; i < 120; i++){
        studentsArray.push(new Students());
    }
}

// funksjon som skal legges inn i hovedfunksjon som kaller på oppdatert posisjon og deretter tegner figur for hver itterasjon
function handleStudents(){
    studentsArray.forEach((student, i) => { // forEach ittererer gjennom hele arrayet
        student.updateStudents(); //oppdaterer posisjon
        student.drawStudents(); // tegner i ny posisjon
        if (posX > student.x + 50 ||
            posX + sizeX < student.x ||
            posY > student.y + 50 || // om ingen av disse linjene er true vil det være umulig at det er kollisjon
            posY + sizeY < student.y // det er derfor jeg sjekker for ingen kollisjon først
        ) {
            //ingen kollisjon
            // har ingen kode her fordi da slipper vi unødvendige kalkulasjoner
        } else {
            lives--; // fjerner et liv ved kollisjon
            studentsArray.splice(i,1); // splice fjerner settet med verdier som kolliderte med spilleren
        }
    });
}

// kager constructor for bøker
class Books {
    constructor(){ // på samme måte som studenter
        this.x = Math.random() * 10000 + 800; //startposisjon x mellom 800 og omtrent 10 000
        this.y = Math.random() * 400 + 75; // y posisjon mellom 1 og 400 (400 fordi figurene er 50px i diameter og "veggen" i bakgrunner er ca. 100px)
        this.speed = 2; // setter en fast fart på bøkene til 3px per frame (samme fart som bakgrunn)
    }
    updateBooks() {
        this.x -= this.speed; // oppdaterer posisjonen for hver frame
    }
    drawBooks() {
        ctx.fillStyle = "rgba(0,0,0,0)"; // usynlig farge, kan endres for å sjekke hitbox
        ctx.beginPath(); //begynner en figur
        ctx.arc(this.x, this.y, 25, 0, Math.PI * 2) // lager sirkel-hitbox for bøker med radius 25
        ctx.fill(); // fyller sirklene med den definerte fargen
        ctx.drawImage(bookImage, this.x - 25, this.y - 25, 50, 50); // tegner bokbildet
    }
}

// funksjon som legger bøker i array på samme måte som studenter
function addBooks() {
    for (let i = 0; i < 25; i++) {
        booksArray.push(new Books());
    }
}

// funksjon som legges inn i hovedfunksjon på samme måte som for studenter
function handleBooks(){               // |
    booksArray.forEach((book, i) => { // |
        book.updateBooks();           // |
        book.drawBooks();             // | Disse linjene fungerer på samme måte som for studenter
        const distance = Math.sqrt((posX + sizeX / 2 - book.x) ** 2 + (posY + sizeY / 2 - book.y) ** 2); // finner midtpunktet i hitboxen til spill-figur og sjekker avstand til midtpunktet av sirklene
        if (distance < 25 + sizeX / 2) { // om avstanden blir mindre enn 25 + sizeX / 2 (50) betyr det at hitboxene berører hverandre
            scoreBooks += 50; // øker score med 50 got hver collisjon
            booksArray.splice(i, 1); // fjerner oppplukket bok
        }
    });
}

function drawPlayer() {
    // funksjoner for piltaster og tilsvarende "wasd"
    if ((keys["KeyD"] || keys["ArrowRight"]) && posX < canvasWidth - sizeX) { //beveg høyre sp lenge figuren ikke er helt til høyre
        posX += 6; // fart
    } 
    if ((keys["KeyA"] || keys["ArrowLeft"]) && posX > 0) { //beveg venstre så lenge fuguren ikke er helt til venstre
        posX -= 6; // fart
    }
    if ((keys["KeyW"] || keys["ArrowUp"]) && posY > 50) { // beveg opp så lenge figuren ikke går av gulvet i bakgrunnen
        posY -= 4; // fart
    }
    if ((keys["KeyS"] || keys["ArrowDown"]) && posY < canvasHeight - sizeY) { // beveg ned så lenge figuren ikke går lenger ned enn at hele hitbox er på skjermen
        posY += 4; // fart
    }
    ctx.fillStyle = "rgba(0,0,0,0)"; // usynlig farge for å enkelt sjekke hitbox om den endres
    ctx.fillRect(posX, posY, sizeX, sizeY); // hitbox
    ctx.drawImage(playerImage, posX, posY - 20, sizeX, sizeY + 35); // tegner spillerfiguren
    
}

//funksjon for å tegne bakgrunnen i spillet
function canvasBackground() {
    ctx.drawImage(backgroundImage, backgroundX, 0, canvasWidth, canvasHeight); //tegner et bilde i canvas med backgroundImage som fil
    ctx.drawImage(backgroundImage, backgroundX + canvasWidth, 0, canvasWidth, canvasHeight); // tegner samme bildet canvasWidth til høyre for første
    // legger inn farten til bildet i funkjsonen
    backgroundX -= backgroundSpeed;
    // resetter startposisjonen når første bildet er av skjermen for å få en sømløs overgang
    if (backgroundX <= -canvasWidth) {
        backgroundX = 0;
    }
}

// funksjon for å oppdatere posisjonen for alle elementer på skjermen, denne funskjonen er viktigst for å styre logikken i spillet
function updatePosition() {

    //skal kun kjøre om spillet er aktivt, altså ikke etter å ha trykket restart
    if (!gameActive) return; //Hinder også funksjonen fra å stacke slik at figuren speeder opp neste gang man trykker start

    // visker ut canvas for hver itterasjon av funksjonen før nye verdier legges til
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // setter inn backgrunn først slik at den komme bakerst i bildet
    canvasBackground();

    
    // setter inn scoreScreen oppe til høyre i canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + Math.floor(scoreScreen), 780, 30); // bruker Math.floor for å kun skrive heltall

    // setter liv oppe til venstre i canvas
    ctx.textAlign = "left";
    ctx.fillText("Antall liv: " + lives, 20, 30);

    // legger til andre studenter og oppdaterer posisjon og sjekker kollisjon
    handleStudents();
    // legger til bøkene som skal gi ekstrapoeng og sjekker kollisjon
    handleBooks();
    //legger til figuren som styres av spiller
    drawPlayer();

    // øker score med 0,2 per frame, for å få omtrent 10 score i sekundet
    score += 0.2;
    // legger sammen score og score fra bøker
    scoreScreen = score + scoreBooks;
    // sjekker om spillet har vart for lenge, eller liv er mindre enn 1 og kjører gameOver() om dette er tilfelle
    if (score > 1150 || lives < 1) {
        gameOver();
    }
    // om spiller får 1700 score er spillet vunnet
    if (scoreScreen > 1700) {
        gameWin();
    }

    // funksjon som får funksjonen til å kalle på seg selv slik at den kjører evig
    requestAnimationFrame(updatePosition);
}

//funksjonen som kjøres onload i body-tag
function startScreen() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Klikk 'start' for å starte spillet", 400, 250);
}

//funksjonen som kjører når man trykker start
function startGame() {
    // resetter startposisjonen til spilleren
    posX = 50;
    posY = 225;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // tømmer canvas

    //oppdaterer gameActive til true;
    gameActive = true;
    
    // starter funksjonen som tengner alle elementer på canvas
    updatePosition();

    // fjerner start knappen
    startButton.remove();
    // legger til restart knappen og definerer funksjonen den skal utføre
    body.appendChild(restartButton);
    restartButton.addEventListener("click", restartGame);
    
    // kjører koden for å legge til studenter i array i startGame fordi det blir resatt av restart-knappen
    addStudents();
    console.log(studentsArray); //logger til consol for å sjekke verdier (det som logges brukes ikke videre av kode, men kan sjekkes av utvikler)

    // kjører koden for å legge til bøker
    addBooks();
    console.log(booksArray); //samme som studenter
}

// lager en eventlistener for escape
document.addEventListener("keydown", function(event) {
    if (event.code === "Escape") {
        pauseGame();
    }
});
// funksjon for pauseskjerm
function pauseGame() {
    paused = !paused;
    gameActive = !paused;
        
        if (paused) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // gjennomsiktig mørk overlay
            ctx.fillRect(0, 0, canvasWidth, canvasHeight); // legger fillStyle definert over, over hele canvas
            ctx.fillStyle = "white";
            ctx.font = "50px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Spillet er satt i pause", 400, 300);
            ctx.font = "20px Arial";
            ctx.fillText("Trykk 'esc' for å fortsette", 400, 350); // skriver to meldinger til canvas
        } else {
            updatePosition(); // starter hoved-loopen når paused = false igjen
        }
}

//funksjon for restart knapp
function restartGame() {
    // setter startposisjoner på nytt
    posX = 50;
    posY = 225;
    //setter gameActive til false igjen
    gameActive = false;
    // setter score tilbake til 0 ved restart
    score = 0;
    // setter score fra bøker tilbake til 0
    scoreBooks = 0;
    // setter lives tilbake til 3 ved restart
    lives = 5;

    // tømmer canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //tømmer array med tilfeldige studenter
    studentsArray.length = 0;
    //tømmer array med bøker
    booksArray.length = 0;

    //kjører funksjon for startskjerm
    startScreen(); 

    //fjerner restart knappen igjen
    restartButton.remove();
    //legger tilbake startknapp
    body.appendChild(startButton);
}

//legger til game over screen
function gameOver() {
    gameActive = false; // setter gameActive til false slik at updateposition() stopper
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // tømmer canvas
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", 400, 200); // gir spiller en melding
    ctx.font = "20px Arial";
    ctx.fillText("Prøv å samle flere bøker før du når fram til klasserommet ditt!", 400, 300);
    ctx.fillText("Prøv å unngå de andre studentene!", 400, 350); // gir spilleren to tips for å vinne spillet
}

// funksjon som kjører når man får nok poeng
function gameWin() {
    gameActive = false; // stopper loopen
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Du kom deg til timen i god behold!", 400, 200); // skriver en melding til skjerm
}