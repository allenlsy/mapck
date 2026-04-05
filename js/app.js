/**
 * Main Application Module
 * Coordinates all components and handles user interactions
 */

import RegionManager from './regionManager.js';
import ScoreTracker from './scoreTracker.js';
import QuizEngine from './quizEngine.js';

class App {
    constructor() {
        this.regionManager = new RegionManager();
        this.scoreTracker = new ScoreTracker();
        this.quizEngine = new QuizEngine(this.regionManager, this.scoreTracker);
        this.timerInterval = null;
        this.currentRegionId = null;
        this.currentMode = null;
        this.currentQuestionCount = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        this.scoreTracker.init();
        await this.loadRegions();
        this.bindEvents();
        // Initialize currentMode from the dropdown default value
        const modeSelect = document.getElementById('mode-select');
        this.currentMode = modeSelect.value;
        console.log('App initialized - currentMode:', this.currentMode);
        this.updateStartButton();
        this.renderScoreHistory();
    }

    /**
     * Load regions from data file
     */
    async loadRegions() {
        try {
            await this.regionManager.loadRegions();
            this.renderRegionSelector();
        } catch (error) {
            console.error('Failed to load regions:', error);
            this.showError('Failed to load region data. Please refresh the page.');
        }
    }

    /**
     * Render region selector dropdown
     */
    renderRegionSelector() {
        const select = document.getElementById('region-select');
        const regions = this.regionManager.getRegions();
        
        select.innerHTML = '<option value="">Select a region...</option>';
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.textContent = region.name;
            select.appendChild(option);
        });

        select.disabled = false;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Setup screen events
        document.getElementById('region-select').addEventListener('change', (e) => {
            this.currentRegionId = e.target.value;
            this.updateStartButton();
        });

        document.getElementById('mode-select').addEventListener('change', (e) => {
            this.currentMode = e.target.value;
            console.log('Mode changed to:', this.currentMode);
            this.updateStartButton();
        });

        document.getElementById('question-count').addEventListener('input', (e) => {
            this.currentQuestionCount = e.target.value ? parseInt(e.target.value) : null;
            console.log('Question count changed to:', this.currentQuestionCount);
        });

        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());

        // Score history events
        document.getElementById('export-scores-btn').addEventListener('click', () => this.exportScores());
        document.getElementById('import-scores-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });
        document.getElementById('import-file-input').addEventListener('change', (e) => this.importScores(e));
        document.getElementById('clear-scores-btn').addEventListener('click', () => {
            this.scoreTracker.clearScores();
            this.renderScoreHistory();
        });

        // Quiz screen events
        document.getElementById('end-quiz-btn').addEventListener('click', () => this.endQuiz());
        document.getElementById('next-btn').addEventListener('click', this.nextQuestion.bind(this));

        // Typing mode events
        document.getElementById('typing-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitTypingAnswer();
            }
        });
        document.getElementById('submit-typing-btn').addEventListener('click', () => this.submitTypingAnswer());

        // Results screen events
        document.getElementById('try-again-btn').addEventListener('click', () => this.showScreen('setup'));
        document.getElementById('back-home-btn').addEventListener('click', () => this.showScreen('setup'));
    }

    /**
     * Update start button state
     */
    updateStartButton() {
        const btn = document.getElementById('start-quiz-btn');
        console.log('updateStartButton - currentRegionId:', this.currentRegionId, 'currentMode:', this.currentMode);
        btn.disabled = !this.currentRegionId || !this.currentMode;
    }

    /**
     * Start a new quiz
     */
    startQuiz() {
        if (!this.currentRegionId || !this.currentMode) return;

        // Initialize quiz
        this.quizEngine.initQuiz(this.currentRegionId, this.currentMode, this.currentQuestionCount);
        this.regionManager.setCurrentRegion(this.currentRegionId);

        // Show quiz screen
        this.showScreen('quiz');
        this.setupQuizUI();
        this.startTimer();
        this.displayQuestion();
    }

    /**
     * Setup quiz UI
     */
    setupQuizUI() {
        const region = this.regionManager.getCurrentRegion();
        document.getElementById('quiz-region').textContent = region.name;
        
        // Show/hide answer containers based on mode
        const multipleChoiceContainer = document.getElementById('multiple-choice-container');
        const typingContainer = document.getElementById('typing-container');
        
        if (this.currentMode === 'multiple_choice') {
            multipleChoiceContainer.classList.remove('hidden');
            typingContainer.classList.add('hidden');
        } else {
            multipleChoiceContainer.classList.add('hidden');
            typingContainer.classList.remove('hidden');
        }

        // Reset UI elements
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('feedback').classList.add('hidden');
    }

    /**
     * Display current question
     */
    displayQuestion() {
        const question = this.quizEngine.getCurrentQuestion();
        if (!question) {
            this.showResults();
            return;
        }

        // Update progress
        document.getElementById('quiz-progress').textContent =
            `Question ${this.quizEngine.getCurrentQuestionNumber()} of ${this.quizEngine.getTotalQuestions()}`;

        // Display question text
        document.getElementById('question-text').textContent = question.question;

        // Update map image based on question
        const mapImage = document.getElementById('map-image');
        
        if (question.image) {
            // Hide image to force reflow
            mapImage.style.display = 'none';
            // Clear the image first to force reload
            mapImage.src = '';
            // Force image reload by adding timestamp to prevent caching
            const imageUrl = question.image + '?t=' + Date.now();
            mapImage.src = imageUrl;
            mapImage.onerror = function() {
                console.error('Failed to load image:', question.image);
            };
            mapImage.onload = function() {
                // Show image after it loads
                mapImage.style.display = 'block';
            };
        } else {
            // Hide image if no image for this question
            mapImage.style.display = 'none';
        }

        // Hide highlight overlay (images will have their own highlighting)
        const highlight = document.getElementById('country-highlight');
        highlight.classList.add('hidden');

        // Display answer options based on mode
        if (this.currentMode === 'multiple_choice') {
            this.displayMultipleChoiceOptions(question);
        } else {
            // Clear typing input and re-enable elements
            const input = document.getElementById('typing-answer');
            input.value = '';
            input.disabled = false;
            input.focus();
            document.getElementById('submit-typing-btn').disabled = false;
        }

        // Reset feedback
        document.getElementById('feedback').classList.add('hidden');
    }

    /**
     * Display multiple choice options
     */
    displayMultipleChoiceOptions(question) {
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';

        const options = this.quizEngine.getMultipleChoiceOptions(question);
        
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleMultipleChoiceAnswer(option, btn));
            choicesContainer.appendChild(btn);
        });
    }

    /**
     * Handle multiple choice answer
     */
    handleMultipleChoiceAnswer(answer, buttonElement) {
        if (this.quizEngine.isAnswered) return;

        const isCorrect = this.quizEngine.validateAnswer(answer);
        const feedback = document.getElementById('feedback');
        const question = this.quizEngine.getCurrentQuestion();

        // Update button styles
        const allButtons = document.querySelectorAll('.choice-btn');
        allButtons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === buttonElement && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Show feedback
        feedback.textContent = isCorrect ? 'Correct!' : `Incorrect. The answer is ${question.correctAnswer}.`;
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.classList.remove('hidden');

        // Show next button
        document.getElementById('next-btn').classList.remove('hidden');
    }

    /**
     * Submit typing answer
     */
    submitTypingAnswer() {
        if (this.quizEngine.isAnswered) return;

        const input = document.getElementById('typing-answer');
        const answer = input.value.trim();
        
        if (!answer) return;

        const isCorrect = this.quizEngine.validateAnswer(answer);
        const feedback = document.getElementById('feedback');
        const question = this.quizEngine.getCurrentQuestion();

        // Show feedback
        feedback.textContent = isCorrect ? 'Correct!' : `Incorrect. The answer is ${question.correctAnswer}.`;
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.classList.remove('hidden');

        // Disable input (but keep submit button enabled)
        input.disabled = true;

        // Show next button
        document.getElementById('next-btn').classList.remove('hidden');
    }

    /**
     * Move to next question
     */
    nextQuestion() {
        console.log('nextQuestion called');
        this.quizEngine.nextQuestion();

        if (this.quizEngine.isComplete()) {
            console.log('Quiz complete, showing results');
            this.showResults();
        } else {
            console.log('Quiz not complete, displaying next question');
            this.displayQuestion();
        }
    }

    /**
     * Start timer
     */
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            const elapsed = this.scoreTracker.getElapsedTime();
            document.getElementById('timer').textContent = 
                this.scoreTracker.formatTime(elapsed);
        }, 1000);
    }

    /**
     * Stop timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * End quiz early
     */
    endQuiz() {
        if (confirm('Are you sure you want to end the quiz early?')) {
            this.showResults();
        }
    }

    /**
     * Show results screen
     */
    showResults() {
        this.stopTimer();
        
        const region = this.regionManager.getCurrentRegion();
        const results = this.quizEngine.getResults();
        const scoreRecord = this.scoreTracker.endQuiz(region.id, this.currentMode);

        // Update results display
        document.getElementById('result-region').textContent = region.name;
        document.getElementById('result-mode').textContent = 
            this.currentMode === 'multiple_choice' ? 'Multiple Choice' : 'Typing';
        document.getElementById('result-score').textContent = 
            `${results.score} / ${results.total}`;
        document.getElementById('result-score').className = 'result-value score';
        document.getElementById('result-time').textContent = 
            this.scoreTracker.formatTime(results.duration);

        // Display breakdown
        this.renderResultsBreakdown(results.answers);

        // Show results screen
        this.showScreen('results');
        this.renderScoreHistory();
    }

    /**
     * Render results breakdown
     */
    renderResultsBreakdown(answers) {
        const container = document.getElementById('results-breakdown');
        container.innerHTML = '';

        answers.forEach((answer, index) => {
            const item = document.createElement('div');
            item.className = 'breakdown-item';
            item.style.cursor = 'pointer';
            item.title = 'Click to see question details';
            item.innerHTML = `
                <div class="breakdown-question">${index + 1}. ${answer.question}</div>
                <div class="breakdown-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                    ${answer.isCorrect ? '✓' : '✗'} ${answer.userAnswer}
                </div>
            `;
            item.addEventListener('click', () => {
                alert(`Question: ${answer.question}\n\nYour answer: ${answer.userAnswer}\nCorrect answer: ${answer.correctAnswer}\n${answer.isCorrect ? 'Correct!' : 'Incorrect!'}`);
            });
            container.appendChild(item);
        });
    }

    /**
     * Render score history
     */
    renderScoreHistory() {
        const container = document.getElementById('score-history');
        const scores = this.scoreTracker.getRecentScores(10);

        if (scores.length === 0) {
            container.innerHTML = '<p class="empty-state">No quiz history yet</p>';
            return;
        }

        container.innerHTML = '';
        scores.forEach(score => {
            const item = document.createElement('div');
            item.className = 'score-history-item';
            
            const date = new Date(score.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            const modeText = score.mode === 'multiple_choice' ? 'MC' : 'Typing';
            const percentage = Math.round((score.score / score.total) * 100);

            item.innerHTML = `
                <div>
                    <div class="score-history-date">${formattedDate}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${modeText} • ${this.scoreTracker.formatTime(score.duration)}
                    </div>
                </div>
                <div class="score-history-score">${score.score}/${score.total} (${percentage}%)</div>
            `;
            container.appendChild(item);
        });
    }

    /**
     * Export scores
     */
    exportScores() {
        this.scoreTracker.exportScores();
    }

    /**
     * Import scores
     */
    async importScores(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const count = await this.scoreTracker.importScores(file);
            alert(`Successfully imported ${count} score(s)`);
            this.renderScoreHistory();
        } catch (error) {
            alert('Failed to import scores: ' + error.message);
        }

        // Reset file input
        event.target.value = '';
    }

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(`${screenName}-screen`).classList.remove('hidden');
    }

    /**
     * Show error message
     */
    showError(message) {
        alert(message);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
