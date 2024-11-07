function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            console.log('SpeechSynthesisUtterance.onend');
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
        };
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Text-to-speech not supported in this browser.');
    }
}
