// Константи и елементи достъпвани чрез HTML за обработка в логиката на играта
const wordContainer = document.getElementById('word-container');
const wrongLettersContainer = document.getElementById('wrong-letters');
const message = document.getElementById('message');
const hangmanCanvas = document.getElementById('hangman');
const ctx = hangmanCanvas.getContext('2d');
const customWordInput = document.getElementById('custom-word');
const startGameButton = document.getElementById('start-game');
const hintElement = document.getElementById('hint');

// речник с думи и подсказки според езика и нивото на трудност
const words = {
    english: {
        easy: [
            { word: 'bug', hint: 'A flaw in a program.' },
            { word: 'git', hint: 'Version control system.' },
            { word: 'api', hint: 'Software communication interface.' },
            { word: 'ram', hint: 'Short-term computer memory.' },
            { word: 'cli', hint: 'Command line interface.' }
        ],
        medium: [
            { word: 'array', hint: 'Indexed collection of elements.' },
            { word: 'debug', hint: 'Finding and fixing errors.' },
            { word: 'token', hint: 'Used for authentication.' },
            { word: 'class', hint: 'Blueprint for objects.' },
            { word: 'stack', hint: 'LIFO data structure.' }
        ],
        hard: [
            { word: 'recursion', hint: 'Function calling itself.' },
            { word: 'algorithm', hint: 'Problem-solving steps.' },
            { word: 'compiler', hint: 'Translates code to machine instructions.' },
            { word: 'database', hint: 'Stores and organizes data.' },
            { word: 'protocol', hint: 'Rules for data transmission.' }
        ]
    },
    bulgarian: {
        easy: [
            { word: 'код', hint: 'Програмен текст.' },
            { word: 'иде', hint: 'Среда за разработка.' },
            { word: 'иксмл', hint: 'Формат за структурирани данни.' },
            { word: 'рам', hint: 'Краткосрочна компютърна памет.' },
            { word: 'кли', hint: 'Интерфейс за команди.' }
        ],
        medium: [
            { word: 'обект', hint: 'Данни със свойства.' },
            { word: 'масив', hint: 'Списък от елементи.' },
            { word: 'данни', hint: 'Съхранявана информация.' },
            { word: 'метод', hint: 'Функция на обект.' },
            { word: 'цикъл', hint: 'Повторение на код.' }
        ],
        hard: [
            { word: 'променлива', hint: 'Съхранява стойност.' },
            { word: 'алгоритъм', hint: 'Стъпки за задача.' },
            { word: 'компилатор', hint: 'Превежда код.' },
            { word: 'база данни', hint: 'Съхранява информация.' },
            { word: 'итерация', hint: 'Повтаря стъпки.' }
        ]
    }
};
    // Рисуване на човечето
function drawHangman() {
    const errors = wrongLetters.length; //прихващане на брой сгершени букви
    ctx.clearRect(0, 0, hangmanCanvas.width, hangmanCanvas.height);

    // Позиции за различните части на човечето по координата според броя грешки
    if (errors > 0) ctx.fillRect(10, hangmanCanvas.height - 20, 100, 10); // Основата
    if (errors > 1) ctx.fillRect(50, 10, 10, hangmanCanvas.height - 30); // Стълб
    if (errors > 2) ctx.fillRect(50, 10, hangmanCanvas.width / 2, 10); // Горна греда
    if (errors > 3) ctx.fillRect(hangmanCanvas.width / 2 + 30, 10, 10, 30); // Въжето
    if (errors > 4) ctx.beginPath(), ctx.arc(hangmanCanvas.width / 2 + 35, 50, 20, 0, Math.PI * 2), ctx.stroke(); // Главата
    if (errors > 5) ctx.fillRect(hangmanCanvas.width / 2 + 30, 70, 10, 50); // Тяло
    if (errors > 6) ctx.moveTo(hangmanCanvas.width / 2 + 35, 80), ctx.lineTo(hangmanCanvas.width / 2 + 10, 100), ctx.stroke(); // Лява ръка
    if (errors > 7) ctx.moveTo(hangmanCanvas.width / 2 + 35, 80), ctx.lineTo(hangmanCanvas.width / 2 + 60, 100), ctx.stroke(); // Дясна ръка
    if (errors > 8) ctx.moveTo(hangmanCanvas.width / 2 + 35, 120), ctx.lineTo(hangmanCanvas.width / 2 + 10, 150), ctx.stroke(); // Ляв крак
    if (errors > 9) ctx.moveTo(hangmanCanvas.width / 2 + 35, 120), ctx.lineTo(hangmanCanvas.width / 2 + 60, 150), ctx.stroke(); // Десен крак
}

    // Преводи на елементи от интерфейса
const translations = {
    english: {
        title: "Hangman",
        hintLabel: "Hint:",
        enterLetter: "Enter a letter:",
        wrongLetters: "Wrong Letters:",
        startGame: "Start Game",
        wonMessage: "Congratulations! You won!",
        lostMessage: "Unfortunately, you lost!",
        difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" }
    },
    bulgarian: {
        title: "Бесеница",
        hintLabel: "Подсказка:",
        enterLetter: "Въведете буква:",
        wrongLetters: "Грешни букви:",
        startGame: "Стартирай игра",
        wonMessage: "Поздравления! Спечелихте!",
        lostMessage: "За съжаление, загубихте!",
        difficulty: { easy: "Лесно", medium: "Средно", hard: "Трудно" }
    }
};

    // Глобални променливи за текущата игра
let selectedWord = '';
let correctLetters = [];
let wrongLetters = [];

    // Функция за прилагане на превода на интерфейса
function applyTranslation(language) {
    const translation = translations[language];
    document.getElementById('game-title').innerText = translation.title;
    hintElement.textContent = translation.hintLabel;
    customWordInput.placeholder = translation.enterLetter;
    document.getElementById('wrong-letters-label').innerText = translation.wrongLetters;
    startGameButton.innerText = translation.startGame;
    document.querySelectorAll('input[name="difficulty"]').forEach(difficulty => {
        const value = difficulty.value;
        const label = difficulty.nextSibling; // Ако label е непосредствено след радио бутона
        if (label && label.nodeType === Node.TEXT_NODE) {
            label.textContent = translation.difficulty[value];
        }
    });
    message.textContent = '';
}
    // Оразмеряване на платното
function resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let canvasSize = Math.min(screenWidth, screenHeight) * 0.8;
    hangmanCanvas.width = canvasSize;
    hangmanCanvas.height = canvasSize;
    drawHangman();
}

    // Допълнителни функции за играта
function resetGame() {
    correctLetters = [];
    wrongLetters = [];
    wordContainer.innerHTML = '';
    wrongLettersContainer.innerHTML = '';
    message.textContent = '';
    resizeCanvas(); // Обновяване на платното
}
function getRandomWord(language, difficulty) {
    const wordList = words[language][difficulty];
    return wordList[Math.floor(Math.random() * wordList.length)];
}
        //показване на думата,чрез трсене на букви от нея, първоначално скрити и изписани с тирета
function displayWord() {
    wordContainer.innerHTML = selectedWord
        .split('')
        .map(letter =>
            `<span style="margin: 0 5px; border-bottom: 2px solid gray; display: inline-block; width: 20px; text-align: center;">
                ${correctLetters.includes(letter) ? letter : ''}
            </span>`
        )
        .join('');//обединява отделните познати букви и ако са познати всички изписва съобщение за победа
    if (wordContainer.innerText.replace(/\n/g, '') === selectedWord) {
        message.textContent = translations[document.querySelector('input[name="language"]:checked').value].wonMessage;
        message.style.color = "green";
    }
}
    //Подсказка
function showHint(hint, language) {
    hintElement.textContent = hint || translations[language].hintLabel;
}
    // след всяка предположена буква обновява състоянието на използваните досега
function updateWrongLetters() {
    wrongLettersContainer.innerHTML = wrongLetters
        .map(letter => `<span>${letter}</span>`)
        .join('');

    drawHangman(); // Обновяване на рисунката въз основа на грешки
    //при достигане на максималния брой допустими грешки и непозната дума изписва съобщение за загуба
    const maxErrors = 10;
    if (wrongLetters.length >= maxErrors) {
        message.textContent = translations[document.querySelector('input[name="language"]:checked').value].lostMessage;
        message.style.color = "red";
    }
}

    // Настройка на играта
function setupGame(wordObject, language) {
    resetGame();
    selectedWord = wordObject.word;
    displayWord();
    showHint(wordObject.hint, language);
    resizeCanvas();
}

    // Слушатели за събития при използваните въведени букви букви /ако езика е грешния да извежда предупреждение
customWordInput.addEventListener('input', (e) => {
    const letter = e.target.value.toLowerCase().trim();
    e.target.value = '';
    const language = document.querySelector('input[name="language"]:checked')?.value || 'english';
    const englishRegex = /^[a-z]$/; //ще позволи само латиница
    const bulgarianRegex = /^[а-я]$/; //ще позволи само кирилица
    if (( language==='english' && !letter.match(englishRegex)) || (language==='bulgarian' && !letter.match(bulgarianRegex))){
        message.textContent = `Please insert leters in ${language=== 'english' ? 'English' : 'Bulgarian'}. `;
        message.style.color = "red";
        return;
    }
    if (!letter.match(/^[a-zа-я]$/i)) {
        message.textContent = translations[language].enterLetter;
        message.style.color = "orange";
        return;
    }

    if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
        message.textContent = "You already guessed this letter.";
        message.style.color = "yellow";
        return;
    }

    if (selectedWord.includes(letter)) {
        correctLetters.push(letter);
        displayWord();
    } else {
        wrongLetters.push(letter);
        updateWrongLetters();
    }
});
    // следи за превод на език
document.querySelectorAll('input[name="language"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
        applyTranslation(selectedLanguage);
    });
});
    

    // следи за избор на ниво на трудност, език и избира произволна дума от речника според езика и сложността
startGameButton.addEventListener('click', () => {
    const language = document.querySelector('input[name="language"]:checked').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const randomWord = getRandomWord(language, difficulty);
    setupGame(randomWord, language);
});
    // следи дали е заредено преди да визуализира
document.addEventListener('DOMContentLoaded', () => {
    const language = document.querySelector('input[name="language"]:checked').value;
    applyTranslation(language);
    resizeCanvas();
});
    // следи кога да оразмерява платното за рисуване
window.addEventListener('resize', resizeCanvas);

