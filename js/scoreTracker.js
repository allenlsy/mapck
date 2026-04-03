/**
 * Score Tracker Module
 * Handles score tracking, storage, and history management
 */

class ScoreTracker {
    constructor() {
        this.scores = [];
        this.currentScore = 0;
        this.currentAnswers = [];
        this.startTime = null;
        this.endTime = null;
        this.STORAGE_KEY = 'mapck_scores';
    }

    /**
     * Initialize score tracker
     */
    init() {
        this.loadScores();
    }

    /**
     * Load scores from localStorage
     */
    loadScores() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.scores = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load scores:', error);
            this.scores = [];
        }
    }

    /**
     * Save scores to localStorage
     */
    saveScores() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scores));
        } catch (error) {
            console.error('Failed to save scores:', error);
        }
    }

    /**
     * Get all scores
     */
    getScores() {
        return this.scores;
    }

    /**
     * Get recent scores (last 10)
     */
    getRecentScores(count = 10) {
        return this.scores.slice(-count).reverse();
    }

    /**
     * Start a new quiz session
     */
    startQuiz() {
        this.currentScore = 0;
        this.currentAnswers = [];
        this.startTime = new Date();
        this.endTime = null;
    }

    /**
     * Record an answer
     */
    recordAnswer(question, userAnswer, correctAnswer, isCorrect) {
        this.currentAnswers.push({
            question,
            userAnswer,
            correctAnswer,
            isCorrect
        });
        if (isCorrect) {
            this.currentScore++;
        }
    }

    /**
     * End quiz and save score
     */
    endQuiz(region, mode) {
        this.endTime = new Date();
        const duration = Math.floor((this.endTime - this.startTime) / 1000);
        const totalQuestions = this.currentAnswers.length;

        const scoreRecord = {
            id: Date.now(),
            timestamp: this.endTime.toISOString(),
            region,
            mode,
            score: this.currentScore,
            total: totalQuestions,
            duration,
            answers: [...this.currentAnswers]
        };

        this.scores.push(scoreRecord);
        this.saveScores();

        return scoreRecord;
    }

    /**
     * Get current quiz progress
     */
    getCurrentProgress() {
        return {
            score: this.currentScore,
            total: this.currentAnswers.length
        };
    }

    /**
     * Get elapsed time in seconds
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        const now = this.endTime || new Date();
        return Math.floor((now - this.startTime) / 1000);
    }

    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Export scores to JSON file
     */
    exportScores() {
        const data = JSON.stringify({ scores: this.scores }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mapck_scores_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import scores from JSON file
     */
    async importScores(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.scores && Array.isArray(data.scores)) {
                        this.scores = [...this.scores, ...data.scores];
                        this.saveScores();
                        resolve(data.scores.length);
                    } else {
                        reject(new Error('Invalid file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Clear all scores
     */
    clearScores() {
        this.scores = [];
        this.saveScores();
    }
}

export default ScoreTracker;
