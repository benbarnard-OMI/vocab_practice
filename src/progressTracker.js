function updateProgressBar(currentWordIndex, totalWords) {
    const progressBar = document.getElementById('progress-bar');
    const progress = (currentWordIndex / totalWords) * 100;
    progressBar.value = progress;
}

function displayCompletionMessage() {
    const completionMessageDiv = document.getElementById('completion-message');
    completionMessageDiv.textContent = 'Congratulations! You have completed the session!';
}
