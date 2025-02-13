console.log('App.js loaded and starting initialization');

import { extractTextFromImage } from './ocr';
import { speakText } from './textToSpeech';
import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import '@fontsource/comic-neue/400.css';
import '@fontsource/lexend/400.css';
import './styles.css';

class VocabularyApp {
    constructor() {
        console.log('VocabularyApp: Initializing');
        this.initializeElements();
        this.initializeState();
        this.bindEventListeners();
        this.initializeAnimations();
        this.initializeOCR();
    }

    async initializeOCR() {
        try {
            const { extractTextFromImage } = await import('./ocr.js');
            this.ocrModule = { extractTextFromImage };
            console.log('OCR module initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR:', error);
            this.showFeedback('Failed to initialize OCR functionality', 'error');
        }
    }

    initializeElements() {
        try {
            this.elements = {
                // Mode containers
                parentMode: document.getElementById('parent-mode'),
                childMode: document.getElementById('child-mode'),
                wizardSteps: document.querySelectorAll('.wizard-step'),
                
                // Upload and review elements
                imageUpload: document.getElementById('image-upload'),
                uploadForm: document.getElementById('upload-form'),
                fileDropZone: document.querySelector('.file-drop-zone'),
                extractedTextDiv: document.getElementById('extracted-text'),
                startSessionButton: document.getElementById('start-session'),
                
                // Study interface elements
                playDefinitionButton: document.getElementById('play-definition'),
                answerInput: document.getElementById('answer-input'),
                submitAnswerButton: document.getElementById('submit-answer'),
                feedbackDiv: document.querySelector('.feedback-message'),
                progressBar: document.querySelector('.progress-fill'),
                progressStars: document.querySelector('.progress-stars'),
                completionMessage: document.getElementById('completion-message'),
                mascot: document.querySelector('.mascot'),
                mascotSpeech: document.querySelector('.mascot-speech-bubble p'),
                
                // Settings elements
                settingsToggle: document.getElementById('settings-toggle'),
                settingsPanel: document.getElementById('parent-controls'),
                textSizeInput: document.getElementById('text-size'),
                speechRateInput: document.getElementById('speech-rate'),
                highContrastToggle: document.getElementById('high-contrast'),
                dyslexicFontToggle: document.getElementById('dyslexic-font'),
                settingsOverlay: document.getElementById('settings-overlay'),
                settingValues: document.querySelectorAll('.setting-value'),
                settingsCloseButton: document.querySelector('.close-button'),
            };

            // Validate critical elements
            Object.entries(this.elements).forEach(([key, element]) => {
                if (!element && !key.includes('Toggle')) {
                    throw new Error(`Required element ${key} not found`);
                }
            });
        } catch (error) {
            console.error('Failed to initialize app:', error);
            document.body.innerHTML = '<div class="error">Failed to load application. Please refresh the page.</div>';
            throw error;
        }
    }

    initializeState() {
        this.state = {
            currentStep: 1,
            extractedText: '',
            currentWordIndex: 0,
            words: [],
            definitions: [],
            attempts: {},
            settings: {
                textSize: 18,
                speechRate: 1,
                highContrast: false,
                dyslexicFont: false
            }
        };
        this.loadSettings();
    }

    initializeAnimations() {
        // Set up initial animations
        gsap.from('.wizard-step', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power2.out'
        });

        // Mascot idle animation
        gsap.to('.mascot', {
            y: -10,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    }

    bindEventListeners() {
        // Settings panel
        console.log('Binding settings events');
        this.elements.settingsToggle?.addEventListener('click', () => {
            console.log('Settings toggle clicked');
            this.toggleSettings();
        });

        this.elements.settingsOverlay?.addEventListener('click', () => {
            console.log('Settings overlay clicked');
            this.closeSettings();
        });

        // File upload
        console.log('Binding file upload events');
        this.elements.imageUpload?.addEventListener('change', (e) => {
            console.log('File input change event triggered');
            e.preventDefault();
            this.handleUpload(e);
        });

        // File upload handling
        this.elements.fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.fileDropZone.classList.add('drag-over');
        });

        this.elements.fileDropZone.addEventListener('dragleave', () => {
            this.elements.fileDropZone.classList.remove('drag-over');
        });

        // Add direct file input change handler
        this.elements.imageUpload.addEventListener('change', (e) => {
            e.preventDefault();
            this.handleUpload(e);
        });

        this.elements.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload(e);
        });
        
        // Navigation and mode switching
        this.elements.startSessionButton.addEventListener('click', () => this.switchMode('child'));
        
        // Study interface
        this.elements.playDefinitionButton.addEventListener('click', this.handlePlay.bind(this));
        this.elements.submitAnswerButton.addEventListener('click', this.handleSubmit.bind(this));
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSubmit();
        });

        // Settings
        this.elements.settingsToggle?.addEventListener('click', this.toggleSettings.bind(this));
        this.bindSettingsListeners();

        // Settings panel close on overlay click
        this.elements.settingsOverlay?.addEventListener('click', () => this.closeSettings());

        // Close settings panel on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.settingsPanel.classList.contains('active')) {
                this.closeSettings();
            }
        });

        // Add close button handler
        this.elements.settingsCloseButton?.addEventListener('click', () => this.closeSettings());

        // Update setting value displays
        this.elements.textSizeInput?.addEventListener('input', (e) => {
            this.updateSettingValue(e.target, `${e.target.value}px`);
        });

        this.elements.speechRateInput?.addEventListener('input', (e) => {
            this.updateSettingValue(e.target, `${e.target.value}x`);
        });
    }

    bindSettingsListeners() {
        const updateSetting = (key, value) => {
            this.state.settings[key] = value;
            this.saveSettings();
            this.applySettings();
        };

        this.elements.textSizeInput?.addEventListener('input', (e) => {
            updateSetting('textSize', e.target.value);
        });

        this.elements.speechRateInput?.addEventListener('input', (e) => {
            updateSetting('speechRate', e.target.value);
        });

        this.elements.highContrastToggle?.addEventListener('change', (e) => {
            updateSetting('highContrast', e.target.checked);
        });

        this.elements.dyslexicFontToggle?.addEventListener('change', (e) => {
            updateSetting('dyslexicFont', e.target.checked);
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('vocabSettings');
        if (saved) {
            this.state.settings = { ...this.state.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }

    saveSettings() {
        localStorage.setItem('vocabSettings', JSON.stringify(this.state.settings));
    }

    applySettings() {
        document.body.style.setProperty('--base-font-size', `${this.state.settings.textSize}px`);
        document.body.dataset.highContrast = this.state.settings.highContrast;
        document.body.dataset.dyslexic = this.state.settings.dyslexicFont;
    }

    toggleSettings() {
        console.log('Toggling settings panel');
        const isOpen = this.elements.settingsPanel.classList.contains('active');
        if (isOpen) {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }

    openSettings() {
        console.log('Opening settings panel');
        this.elements.settingsPanel.classList.add('active');
        this.elements.settingsOverlay.classList.add('active');
        this.elements.settingsToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        console.log('Closing settings panel');
        this.elements.settingsPanel.classList.remove('active');
        this.elements.settingsOverlay.classList.remove('active');
        this.elements.settingsToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    updateSettingValue(input, value) {
        const settingGroup = input.closest('.setting-group');
        const valueDisplay = settingGroup.querySelector('.setting-value');
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
    }

    async handleUpload(event) {
        event.preventDefault();
        console.log('Upload handler triggered');
        
        const file = this.elements.imageUpload.files[0];
        if (!file) {
            this.showFeedback('Please select an image first', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.showFeedback('Please select an image file', 'error');
            return;
        }

        try {
            this.showLoadingState(true);
            this.showFeedback('Processing image...', 'info');
            
            console.log('Starting OCR for file:', file.name);
            const text = await this.ocrModule.extractTextFromImage(file);
            
            if (!text) {
                throw new Error('No text was extracted from the image');
            }
            
            console.log('OCR completed, text length:', text.length);
            this.parseAndDisplayText(text);
            this.advanceStep();
        } catch (error) {
            console.error('Upload error:', error);
            this.showFeedback(`Failed to process image: ${error.message}`, 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    parseAndDisplayText(text) {
        try {
            console.log('Parsing text:', text);
            // Split by newlines and filter out empty lines
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && line.length > 0);
            
            if (lines.length === 0) {
                throw new Error('No text content found');
            }

            // Process lines to extract word-definition pairs
            const pairs = [];
            let currentWord = null;
            let currentDefinition = '';

            for (let line of lines) {
                // Skip header lines or empty lines
                if (line.toLowerCase().includes('teacherfiera.com') || 
                    line.trim().length === 0 || 
                    /^\d+$/.test(line.trim())) {
                    continue;
                }

                // If line ends with a dash, it's likely a definition continuation
                if (line.trim().endsWith('-')) {
                    if (currentDefinition) {
                        currentDefinition += ' ' + line.slice(0, -1).trim();
                    }
                    continue;
                }

                // If line contains a number followed by |, it's likely a new word
                const wordMatch = line.match(/^\s*(\d+\s*\|)?\s*([a-zA-Z\s()]+)\s*$/);
                if (wordMatch) {
                    // If we have a previous word-definition pair, save it
                    if (currentWord && currentDefinition) {
                        pairs.push([currentWord, currentDefinition.trim()]);
                    }
                    currentWord = wordMatch[2].trim();
                    currentDefinition = '';
                } else if (currentWord) {
                    // If we have a current word but no definition yet, this line is likely the definition
                    if (!currentDefinition) {
                        currentDefinition = line.trim();
                    } else {
                        // Append to existing definition
                        currentDefinition += ' ' + line.trim();
                    }
                }
            }

            // Add the last pair if exists
            if (currentWord && currentDefinition) {
                pairs.push([currentWord, currentDefinition.trim()]);
            }

            if (pairs.length === 0) {
                throw new Error('No valid word-definition pairs found');
            }

            this.state.words = pairs.map(([word]) => word);
            this.state.definitions = pairs.map(([_, def]) => def);

            console.log('Parsed pairs:', pairs);

            // Display the parsed content in a formatted way
            const formattedText = pairs
                .map(([word, def], index) => `${index + 1}. ${word}: ${def}`)
                .join('\n\n');

            this.elements.extractedTextDiv.textContent = formattedText;
            this.showFeedback('Text processed successfully! Review and click Start when ready.', 'success');
            this.advanceStep();
        } catch (error) {
            console.error('Parsing Error:', error);
            this.showFeedback('Error parsing text: Please ensure words and definitions are properly formatted', 'error');
            this.resetState();
        }
    }

    handlePlay() {
        const currentDefinition = this.state.definitions[this.state.currentWordIndex];
        console.log('Playing definition:', currentDefinition); // Debug log
        
        if (currentDefinition) {
            try {
                const utterance = new SpeechSynthesisUtterance(currentDefinition);
                utterance.rate = this.state.settings.speechRate;
                utterance.onstart = () => {
                    console.log('Speech started'); // Debug log
                    this.animateMascotSpeaking();
                };
                utterance.onerror = (event) => {
                    console.error('Speech Error:', event); // Debug log
                    this.showFeedback('Failed to play audio. Please try again.', 'error');
                };
                speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Speech Synthesis Error:', error); // Debug log
                this.showFeedback('Text-to-speech failed. Please check your browser settings.', 'error');
            }
        } else {
            console.error('No definition found for index:', this.state.currentWordIndex); // Debug log
        }
    }

    animateMascotSpeaking() {
        gsap.to('.mascot', {
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 0.2,
            repeat: 3,
            yoyo: true
        });
    }

    handleSubmit() {
        const answer = this.elements.answerInput.value.trim();
        if (!answer) {
            this.showFeedback('Please type an answer', 'error');
            return;
        }

        const currentWord = this.state.words[this.state.currentWordIndex];
        if (answer.toLowerCase() === currentWord.toLowerCase()) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(answer, currentWord);
        }
    }

    handleCorrectAnswer() {
        this.showFeedback('Great job! 🌟', 'success');
        this.addStar();
        this.animateSuccess();
        
        this.state.currentWordIndex++;
        this.updateProgress();
        
        if (this.state.currentWordIndex < this.state.words.length) {
            setTimeout(() => {
                this.elements.answerInput.value = '';
                gsap.to('.definition-card', {
                    x: '100%',
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        this.handlePlay();
                        gsap.fromTo('.definition-card', 
                            { x: '-100%', opacity: 0 },
                            { x: '0%', opacity: 1, duration: 0.3 }
                        );
                    }
                });
            }, 1000);
        } else {
            this.showCompletion();
        }
    }

    handleIncorrectAnswer(answer, correctWord) {
        const attempts = this.state.attempts[this.state.currentWordIndex] || 0;
        this.state.attempts[this.state.currentWordIndex] = attempts + 1;

        if (attempts >= 2) {
            // Show hint after 3 attempts
            const hint = `Hint: The word starts with "${correctWord[0]}"`;
            this.showFeedback(`Let's try again! ${hint}`, 'warning');
        } else {
            this.showFeedback("That's not quite right. Try again!", 'error');
        }

        gsap.to('.answer-input', {
            x: [-10, 10, -10, 10, 0],
            duration: 0.4,
            ease: 'power1.inOut'
        });
    }

    showCompletion() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        this.elements.completionMessage.textContent = 'Congratulations! You\'ve learned all the words! 🎉';
        this.elements.mascotSpeech.textContent = 'You did it! Great job!';
        
        gsap.to('.mascot', {
            rotation: 360,
            scale: 1.2,
            duration: 1,
            ease: 'back.out'
        });
    }

    addStar() {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = '⭐';
        this.elements.progressStars.appendChild(star);
        
        gsap.from(star, {
            scale: 0,
            rotation: 180,
            duration: 0.5,
            ease: 'back.out'
        });
    }

    updateProgress() {
        const progress = (this.state.currentWordIndex / this.state.words.length) * 100;
        gsap.to(this.elements.progressBar, {
            width: `${progress}%`,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    showFeedback(message, type) {
        this.elements.feedbackDiv.textContent = message;
        this.elements.feedbackDiv.className = `feedback-message ${type}`;
        
        gsap.from(this.elements.feedbackDiv, {
            y: -20,
            opacity: 0,
            duration: 0.3
        });
    }

    showLoadingState(isLoading) {
        this.elements.fileDropZone.classList.toggle('is-loading', isLoading);
        
        // Remove existing loading indicator if it exists
        const existingIndicator = this.elements.fileDropZone.querySelector('.loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (isLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-indicator';
            loadingDiv.textContent = 'Processing image...';
            this.elements.fileDropZone.appendChild(loadingDiv);
        }
    }

    switchMode(mode) {
        const modes = {
            parent: this.elements.parentMode,
            child: this.elements.childMode
        };

        Object.values(modes).forEach(el => el.classList.remove('active'));
        modes[mode].classList.add('active');

        if (mode === 'child') {
            this.handlePlay();
        }
    }

    advanceStep() {
        const currentStep = this.elements.wizardSteps[this.state.currentStep - 1];
        const nextStep = this.elements.wizardSteps[this.state.currentStep];

        if (nextStep) {
            gsap.to(currentStep, {
                opacity: 0,
                x: -50,
                duration: 0.3,
                onComplete: () => {
                    currentStep.style.display = 'none';
                    nextStep.style.display = 'block';
                    gsap.fromTo(nextStep,
                        { opacity: 0, x: 50 },
                        { opacity: 1, x: 0, duration: 0.3 }
                    );
                }
            });

            this.state.currentStep++;
        }
    }

    resetState() {
        this.state.currentStep = 1;
        this.state.currentWordIndex = 0;
        this.state.words = [];
        this.state.definitions = [];
        this.state.attempts = {};
        this.elements.progressStars.innerHTML = '';
        this.updateProgress();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VocabularyApp();
});
