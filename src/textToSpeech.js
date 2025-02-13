export function speakText(text) {
    return new Promise((resolve, reject) => {
        console.log('TTS: Attempting to speak:', text);
        
        if (!('speechSynthesis' in window)) {
            console.error('TTS: Speech synthesis not supported');
            reject(new Error('Text-to-speech is not supported in this browser'));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            console.log('TTS: Speech started');
        };
        
        utterance.onend = () => {
            console.log('TTS: Speech completed');
            resolve();
        };
        
        utterance.onerror = (event) => {
            console.error('TTS: Speech error:', event);
            reject(new Error('Speech synthesis failed'));
        };

        console.log('TTS: Starting speech');
        window.speechSynthesis.speak(utterance);
    });
}
