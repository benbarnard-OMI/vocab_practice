document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const uploadForm = document.getElementById('upload-form');
    const extractedTextDiv = document.getElementById('extracted-text');
    const editTextButton = document.getElementById('edit-text');
    const playDefinitionButton = document.getElementById('play-definition');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerButton = document.getElementById('submit-answer');
    const feedbackDiv = document.getElementById('feedback');
    const progressBar = document.getElementById('progress-bar');
    const completionMessageDiv = document.getElementById('completion-message');

    let extractedText = '';
    let currentWordIndex = 0;
    let words = [];
    let definitions = [];

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const file = imageUpload.files[0];
        if (file) {
            try {
                extractedText = await extractTextFromImage(file);
                displayExtractedText(extractedText);
            } catch (error) {
                console.error('Error extracting text:', error);
            }
        }
    });

    editTextButton.addEventListener('click', () => {
        const editedText = prompt('Edit the extracted text:', extractedText);
        if (editedText !== null) {
            extractedText = editedText;
            displayExtractedText(extractedText);
        }
    });

    playDefinitionButton.addEventListener('click', () => {
        if (definitions[currentWordIndex]) {
            speakText(definitions[currentWordIndex]);
        }
    });

    submitAnswerButton.addEventListener('click', () => {
        const answer = answerInput.value.trim();
        if (answer.toLowerCase() === words[currentWordIndex].toLowerCase()) {
            feedbackDiv.textContent = 'Great job!';
            feedbackDiv.style.color = 'green';
            currentWordIndex++;
            updateProgress();
            if (currentWordIndex < words.length) {
                setTimeout(() => {
                    answerInput.value = '';
                    playDefinitionButton.click();
                }, 1000);
            } else {
                displayCompletionMessage();
            }
        } else {
            feedbackDiv.textContent = "Let's try again!";
            feedbackDiv.style.color = 'red';
        }
    });

    function displayExtractedText(text) {
        extractedTextDiv.textContent = text;
        const lines = text.split('\n');
        words = lines.map(line => line.split(':')[0].trim());
        definitions = lines.map(line => line.split(':')[1].trim());
    }

    function updateProgress() {
        const progress = (currentWordIndex / words.length) * 100;
        progressBar.value = progress;
    }

    function displayCompletionMessage() {
        completionMessageDiv.textContent = 'Congratulations! You have completed the session!';
    }
});
