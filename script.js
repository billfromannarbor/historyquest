let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeElapsed = 0;
let selectedOption = null;

let allQuestions = [];

// Load questions from combinedQuestions.json using fetch
fetch('combinedQuestions.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data;
        questions = selectRandomQuestions(3);
        showQuestion();
    })
    .catch(error => console.error('Error loading questions:', error));

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function selectRandomQuestions(numQuestions) {
    const shuffledQuestions = shuffle([...allQuestions]);
    return shuffledQuestions.slice(0, numQuestions);
}

function startTimer() {
    timeElapsed = 0;
    document.getElementById('time').textContent = timeElapsed;
    timer = setInterval(() => {
        timeElapsed++;
        document.getElementById('time').textContent = timeElapsed;
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function showQuestion() {
    const questionData = questions[currentQuestionIndex];
    document.getElementById('question').textContent = questionData.question;
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    if (questionData.type === 'multiple-choice') {
        const shuffledOptions = shuffle([...questionData.options]);
        shuffledOptions.forEach(option => {
            const li = document.createElement('li');
            li.textContent = option;
            li.onclick = () => selectOption(li, option);
            optionsContainer.appendChild(li);
        });
    } else if (questionData.type === 'timeline') {
        let shuffledEvents;
        do {
            shuffledEvents = shuffle([...questionData.correct_order]);
        } while (JSON.stringify(shuffledEvents) === JSON.stringify(questionData.correct_order));

        shuffledEvents.forEach((event, index) => {
            const li = document.createElement('li');
            li.textContent = event;

            const radioContainer = document.createElement('div');
            radioContainer.classList.add('radio-container');

            for (let i = 0; i < questionData.correct_order.length; i++) {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `order-${index}`;
                radio.value = i;
                radio.onchange = () => document.getElementById('submit-answer').style.display = 'block';
                label.appendChild(radio);
                label.appendChild(document.createTextNode(i + 1));
                radioContainer.appendChild(label);
            }

            li.appendChild(radioContainer);
            optionsContainer.appendChild(li);
        });
    } else if (questionData.type === 'true-false') {
        ["True", "False"].forEach(option => {
            const li = document.createElement('li');
            li.textContent = option;
            li.onclick = () => selectOption(li, option);
            optionsContainer.appendChild(li);
        });
    }

    document.getElementById('result').textContent = '';
    document.getElementById('submit-answer').style.display = 'none';
    document.getElementById('next-question').style.display = 'none';
    startTimer();
}

function selectOption(li, option) {
    // Deselect previous option
    if (selectedOption) {
        selectedOption.classList.remove('selected');
    }
    // Select new option
    selectedOption = li;
    selectedOption.classList.add('selected');
    document.getElementById('submit-answer').style.display = 'block';
}

function checkAnswer() {
    stopTimer();
    const questionData = questions[currentQuestionIndex];
    const resultElement = document.getElementById('result');

    if (questionData.type === 'multiple-choice' || questionData.type === 'true-false') {
        if (selectedOption && selectedOption.textContent === questionData.correct_answer) {
            resultElement.textContent = 'CORRECT';
            resultElement.style.color = 'green';
            score += Math.max(15 - Math.floor(timeElapsed / 5), 0);
        } else {
            resultElement.textContent = 'INCORRECT';
            resultElement.style.color = 'red';
        }
    } else if (questionData.type === 'timeline') {
        const radioGroups = document.querySelectorAll('#options .radio-container');
        const selectedOrder = Array.from(radioGroups).map((group, index) => {
            const selectedRadio = group.querySelector('input[type="radio"]:checked');
            return {
                event: questionData.correct_order[index],
                order: selectedRadio ? parseInt(selectedRadio.value, 10) : -1
            };
        }).sort((a, b) => a.order - b.order).map(item => item.event);

        if (JSON.stringify(selectedOrder) === JSON.stringify(questionData.correct_order)) {
            resultElement.textContent = 'CORRECT';
            resultElement.style.color = 'green';
            score += Math.max(15 - Math.floor(timeElapsed / 5), 0);
        } else {
            resultElement.textContent = 'INCORRECT';
            resultElement.style.color = 'red';
        }
    }

    document.getElementById('score-value').textContent = score;
    document.getElementById('next-question').style.display = 'block';
    document.getElementById('submit-answer').style.display = 'none';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('result').textContent = `Final Score: ${score}`;
    document.getElementById('restart').style.display = 'block';
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('score-value').textContent = score;
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('timer').style.display = 'block';
    document.getElementById('restart').style.display = 'none';
    questions = selectRandomQuestions(3); // Select 3 random questions
    showQuestion();
}

document.getElementById('submit-answer').onclick = checkAnswer;
document.getElementById('next-question').onclick = nextQuestion;
document.getElementById('restart').onclick = restartQuiz; 