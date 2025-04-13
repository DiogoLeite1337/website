document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const quizData = [
        // ==================================================================
        // ====> START: REPLACE THIS WITH YOUR 10 QUESTIONS/DATA <====
        // ==================================================================
        // FORMAT:
        // {
        //   question: "Your question text here?",
        //   answer: "correctanswer", // The exact correct answer (lowercase recommended)
        //   answerAlt: "alternatecorrect", // Optional: An alternative correct answer
        //   hint: "A helpful hint.", // Hint text specific to this question
        //   coordinatePiece: "48.", // The piece of coordinate revealed
        //   choices: ["correctanswer", "wrongoption1", "wrongoption2", "wrongoption3"] // Array of choices including the correct one
        // },
        // EXAMPLE:
        { question: "What is the spell to unlock doors?", answer: "alohomora", hint: "It sounds like 'Aloha' and 'Open'.", coordinatePiece: "49.", choices: ["expelliarmus", "alohomora", "wingardium leviosa", "lumos"] },
        { question: "Which magical creature guards the Sorcerer's Stone (in the book)?", answer: "fluffy", hint: "It's a three-headed dog.", coordinatePiece: "857", choices: ["norbert", "fluffy", "buckbeak", "aragog"] },
        { question: "What number is Harry's vault at Gringotts?", answer: "687", hint: "It's a three-digit number.", coordinatePiece: "453", choices: ["713", "687", "711", "592"] },
        { question: "How many players are on a Quidditch team?", answer: "7", hint: "Think about the positions.", coordinatePiece: "225", choices: ["5", "7", "6", "8"] },
        { question: "What form does Hermione's Patronus take?", answer: "otter", hint: "A playful water mammal.", coordinatePiece: "560", choices: ["stag", "jack russell terrier", "otter", "hare"] },
        { question: "Which Hogwarts house values bravery?", answer: "gryffindor", hint: "Its colors are red and gold.", coordinatePiece: "27°", choices: ["hufflepuff", "ravenclaw", "slytherin", "gryffindor"] },
        { question: "What is the name of Ron's pet rat?", answer: "scabbers", hint: "He's secretly an Animagus.", coordinatePiece: ", 6", choices: ["crookshanks", "hedwig", "scabbers", "pigwidgeon"] },
        { question: "What magical object shows the 'heart's desire'?", answer: "mirror of erised", hint: "'Erised' spelled backwards is...", coordinatePiece: ".09", choices: ["pensieve", "remembrall", "mirror of erised", "deluminator"] },
        { question: "What street do the Dursleys live on?", answer: "privet drive", hint: "It's named after a type of bush.", coordinatePiece: "011", choices: ["spinner's end", "magnolia crescent", "privet drive", "grimmauld place"] },
        { question: "Who is the Half-Blood Prince?", answer: "severus snape", answerAlt: "snape", hint: "A potions master with greasy hair.", coordinatePiece: "818°", choices: ["albus dumbledore", "tom riddle", "severus snape", "sirius black"] }

         // ==================================================================
         // ====> END: REPLACE THIS WITH YOUR 10 QUESTIONS/DATA <====
         // ==================================================================
    ];
    // ====> REPLACE WITH YOUR FINAL TARGET COORDINATES <====
    const finalCoordinates = "49.85745322556027°, 6.0901181822089°";
    // ========================================================

    const googleMapsQuery = finalCoordinates.replace(/°/g, '').replace(/ /g, ''); // Format for URL
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`;


    // --- State Variables ---
    let currentQuestionIndex = 0;
    let revealedCoords = "";
    // Removed shake/hint state variables: isHintShowing, lastHintTime, hintCooldown, motionHandler
    let snitchCaughtThisQuestion = false; // Track if snitch caught for current question


    // --- DOM Elements ---
    const container = document.getElementById('container');
    const welcomeScreen = document.getElementById('welcome-screen');
    const envelopeOverlay = document.getElementById('envelope-overlay');
    const envelope = envelopeOverlay.querySelector('.envelope');
    const quizScreen = document.getElementById('quiz-screen');
    const finalScreen = document.getElementById('final-screen');

    const startButton = document.getElementById('start-button');
    const continueButton = document.getElementById('continue-to-quiz');
    const submitButton = document.getElementById('submit-button');
    const answerInput = document.getElementById('answer-input');

    const questionNumberEl = document.getElementById('question-number');
    const questionTextEl = document.getElementById('question-text');
    const contextHintEl = document.getElementById('context-hint'); // NEW: Context hint element
    const feedbackMessageEl = document.getElementById('feedback-message');
    const revealedCoordsEl = document.getElementById('revealed-coordinates');
    const mcOptionsContainer = document.getElementById('multiple-choice-options');

    // Removed hintArea, hintTextEl, sortingHatImg (the one in hint area)

    const finalMessageEl = document.getElementById('final-message');
    const fullCoordinatesEl = document.getElementById('full-coordinates');
    const mapLink = document.getElementById('map-link');
    const fireworksContainer = document.getElementById('fireworks-container');

    const goldenSnitchEl = document.getElementById('golden-snitch');

    // --- REMOVED Shake Detection Functions ---
    // (handleMotionEvent, requestMotionPermission)


    // --- Core Functions ---
    function startQuest() {
        welcomeScreen.classList.remove('active');
        welcomeScreen.classList.add('hidden'); // Explicitly hide

        // Show and animate envelope
        envelopeOverlay.classList.remove('hidden'); // Ensure it's not display:none
        envelopeOverlay.classList.add('visible');
        // Delay adding 'opening' class slightly to ensure transition starts
        setTimeout(() => {
             if (envelope) { // Check if envelope exists before adding class
                envelope.classList.add('opening');
             }
        }, 100); // Short delay after overlay becomes visible
    }

    function proceedToQuiz() {
        envelopeOverlay.classList.remove('visible');
        envelopeOverlay.classList.add('hidden'); // Hide envelope
        quizScreen.classList.remove('hidden'); // Ensure quiz screen is not display:none
        quizScreen.classList.add('active'); // Show quiz

        // REMOVED call to requestMotionPermission();
        displayQuestion(); // Display the first question
        activateSnitch(); // Make the snitch appear and start flying
    }

    function activateSnitch() {
        if (!goldenSnitchEl) return; // Guard clause
        // Check container dimensions *after* it's visible
        setTimeout(() => {
            goldenSnitchEl.classList.remove('snitch-inactive');
            goldenSnitchEl.classList.add('snitch-active');
        }, 100); // Small delay to ensure layout is calculated
    }

    function deactivateSnitch() {
         if (!goldenSnitchEl) return; // Guard clause
        goldenSnitchEl.classList.remove('snitch-active');
        goldenSnitchEl.classList.add('snitch-inactive'); // Use inactive class for consistent hiding
    }

    // Fisher-Yates (Knuth) Shuffle Algorithm
    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    function displayMultipleChoice() {
        // Ensure elements exist
        if (snitchCaughtThisQuestion || currentQuestionIndex >= quizData.length || !mcOptionsContainer || !quizData[currentQuestionIndex]) return;

        const currentQuestion = quizData[currentQuestionIndex];
        if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
            console.warn("No multiple choices defined for question:", currentQuestionIndex);
            return; // No choices defined
        }

        snitchCaughtThisQuestion = true; // Mark as caught for this question
        mcOptionsContainer.innerHTML = ''; // Clear previous options
        mcOptionsContainer.style.display = 'flex'; // Make container visible

        const shuffledChoices = shuffleArray([...currentQuestion.choices]); // Shuffle a copy

        shuffledChoices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.classList.add('mc-button');
            button.dataset.choice = choice; // Store original case for input field
            button.addEventListener('click', () => {
                if (answerInput) {
                    answerInput.value = choice; // Fill input with the choice text
                }
                mcOptionsContainer.style.display = 'none'; // Hide options after selection
                handleSubmit(); // Submit the answer automatically
            });
            mcOptionsContainer.appendChild(button);
        });

         // Optional: Add visual feedback for catching snitch
         if (goldenSnitchEl) {
            goldenSnitchEl.style.filter = 'drop-shadow(0 0 10px gold)';
             setTimeout(() => {
                goldenSnitchEl.style.filter = 'drop-shadow(3px 3px 5px rgba(0,0,0,0.4))';
             }, 300);
         }
    }

    function displayQuestion() {
        // Ensure elements exist before proceeding
        if (!quizData || currentQuestionIndex >= quizData.length || !questionNumberEl || !questionTextEl || !contextHintEl || !revealedCoordsEl || !answerInput || !feedbackMessageEl || !mcOptionsContainer) {
             if (currentQuestionIndex >= quizData.length && quizData.length > 0) { // Check quizData length > 0
                 showFinalScreen(); // Proceed to final screen if all questions done
             } else if (!quizData || quizData.length === 0) {
                 console.error("Quiz data is empty or missing.");
                 // Handle error state, maybe show an error message on the page
             } else {
                  console.error("Required element missing for displayQuestion. Index:", currentQuestionIndex);
             }
             return;
        }

        const currentQuestion = quizData[currentQuestionIndex];
        questionNumberEl.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
        questionTextEl.textContent = currentQuestion.question;

        // NEW: Display context hint
        if (currentQuestion.hint) {
            contextHintEl.textContent = currentQuestion.hint + " 🪄";
            contextHintEl.style.display = 'block'; // Ensure it's visible
        } else {
            contextHintEl.textContent = ""; // Clear if no hint
            contextHintEl.style.display = 'none'; // Hide if no hint
        }

        revealedCoordsEl.textContent = revealedCoords || "-"; // Show revealed coords or placeholder
        answerInput.value = ""; // Clear input
        feedbackMessageEl.textContent = ""; // Clear feedback
        feedbackMessageEl.className = ""; // Clear feedback class
        answerInput.disabled = false; // Re-enable input
        if (submitButton) submitButton.disabled = false; // Re-enable button if it exists

        mcOptionsContainer.innerHTML = ''; // Clear MC options
        mcOptionsContainer.style.display = 'none'; // Hide MC container
        snitchCaughtThisQuestion = false; // Reset snitch catch status for the new question
        answerInput.focus(); // Focus input for user

        // REMOVED hint area visibility/text reset

        // Ensure snitch is active if it wasn't already
        if (goldenSnitchEl && !goldenSnitchEl.classList.contains('snitch-active')) {
             activateSnitch();
        }
    }

    function handleSubmit() {
         // Ensure elements exist
         if (!answerInput || !quizData || currentQuestionIndex >= quizData.length || !feedbackMessageEl) return;

        const userAnswer = answerInput.value.trim().toLowerCase();
        if (!userAnswer) return; // Don't submit empty answers

        const currentQuestion = quizData[currentQuestionIndex];
        const correctAnswer = currentQuestion.answer.toLowerCase();
        const correctAnswerAlt = currentQuestion.answerAlt ? currentQuestion.answerAlt.toLowerCase() : null;

        if (userAnswer === correctAnswer || (correctAnswerAlt && userAnswer === correctAnswerAlt)) {
            // --- CORRECT ANSWER ---
            feedbackMessageEl.textContent = "Correct! ✨";
            feedbackMessageEl.className = "correct";
            if (currentQuestion.coordinatePiece) { // Only add if piece exists
                 revealedCoords += currentQuestion.coordinatePiece;
            }
            currentQuestionIndex++;

            answerInput.disabled = true;
            if (submitButton) submitButton.disabled = true;
            if (mcOptionsContainer) mcOptionsContainer.style.display = 'none'; // Ensure MC options hidden

            setTimeout(() => {
                displayQuestion(); // Load next question or final screen
            }, 1800); // Wait time

        } else {
            // --- INCORRECT ANSWER ---
            feedbackMessageEl.textContent = "Not quite... Try again! 🧙";
            feedbackMessageEl.className = "incorrect";
            answerInput.focus();
            answerInput.select();

            // Reset snitch flag if answer was wrong, allowing another catch attempt
            snitchCaughtThisQuestion = false;

            // Optional: Shake animation on incorrect
            if (container) { // Check if container exists
                container.style.animation = 'shakeHorizontal 0.4s ease-in-out';
                setTimeout(() => {
                    container.style.animation = 'none';
                }, 400);
            }
        }
    }

    // Add a shake animation for incorrect answers dynamically (Keep this)
    try {
        const styleSheet = document.styleSheets[0];
        if (styleSheet) {
            const keyframes = `
            @keyframes shakeHorizontal {
              10%, 90% { transform: translateX(-3px); }
              20%, 80% { transform: translateX(3px); }
              30%, 50%, 70% { transform: translateX(-2px); }
              40%, 60% { transform: translateX(2px); }
            }`;
             let ruleExists = false;
             for(let i=0; i< styleSheet.cssRules.length; i++){
                  if (styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE && styleSheet.cssRules[i].name === 'shakeHorizontal'){
                     ruleExists = true;
                     break;
                 }
             }
             if(!ruleExists) {
                styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
             }
        }
    } catch (e) {
        console.warn("Could not insert keyframes rule: ", e);
    }

    // REMOVED showHint function

    // --- Fireworks Function --- (Keep this)
    function triggerFireworks() {
        if (!fireworksContainer || !container) return; // Guard clause, add container check

        const numSparkles = 50; // Number of sparkles
        const colors = ['#740001', '#daa520', '#FFC700', '#ff4500', '#FFFFFF'];

        fireworksContainer.innerHTML = ''; // Clear any previous sparkles

        for (let i = 0; i < numSparkles; i++) {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');

            sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            const angle = Math.random() * Math.PI * 2;
            const maxDistance = Math.min(container.clientWidth, container.clientHeight) * 0.6;
            const distance = Math.random() * maxDistance;
            const translateX = Math.cos(angle) * distance;
            const translateY = Math.sin(angle) * distance;

            sparkle.style.setProperty('--tx', `${translateX}px`);
            sparkle.style.setProperty('--ty', `${translateY}px`);
            sparkle.style.animationDelay = `${Math.random() * 0.5}s`;

            fireworksContainer.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1200 + 500);
        }
    }


    function showFinalScreen() {
        // Ensure elements exist
        if (!quizScreen || !finalScreen || !fullCoordinatesEl || !mapLink) return;

        quizScreen.classList.remove('active');
        quizScreen.classList.add('hidden');
        finalScreen.classList.remove('hidden'); // Ensure final screen not display:none
        finalScreen.classList.add('active');
        fullCoordinatesEl.textContent = finalCoordinates;
        mapLink.href = mapUrl;

        deactivateSnitch(); // Stop snitch animation/visibility

        triggerFireworks(); // Trigger the fireworks effect

        // REMOVED check/removal of motionHandler
    }

    // --- Event Listeners ---
    if (startButton) startButton.addEventListener('click', startQuest);
    if (continueButton) continueButton.addEventListener('click', proceedToQuiz);
    if (submitButton) submitButton.addEventListener('click', handleSubmit);
    if (goldenSnitchEl) goldenSnitchEl.addEventListener('click', displayMultipleChoice);

    if (answerInput) {
        answerInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSubmit();
            }
        });
    }

    // --- Initial Setup ---
    if(quizScreen) quizScreen.classList.add('hidden');
    if(finalScreen) finalScreen.classList.add('hidden');
    if(envelopeOverlay) envelopeOverlay.classList.add('hidden');
    if(welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.classList.add('active');
    } else {
        console.error("Welcome screen element not found!");
    }

}); // End DOMContentLoaded