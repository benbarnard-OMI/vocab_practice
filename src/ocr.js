import Tesseract from 'tesseract.js';
import { getConfig } from './config';

// Log Tesseract initialization
console.log('Tesseract imported:', !!Tesseract);

// Initialize Tesseract worker
let worker = null;

async function ensureWorkerInitialized() {
    if (!worker) {
        console.log('Initializing new Tesseract worker');
        worker = await Tesseract.createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        console.log('Tesseract worker ready');
    }
    return worker;
}

export async function extractTextFromImage(imageFile) {
    console.log('Starting text extraction for:', imageFile.name);
    
    try {
        const worker = await ensureWorkerInitialized();
        console.log('Worker initialized, starting recognition');
        
        const result = await worker.recognize(imageFile);
        console.log('Recognition completed');
        
        const text = result.data.text;
        if (!text || text.trim().length === 0) {
            throw new Error('No text was found in the image');
        }
        
        console.log('Extracted text length:', text.length);
        return text;
    } catch (error) {
        console.error('OCR extraction error:', error);
        await worker?.terminate();
        worker = null;
        throw error;
    }
}

// Cleanup function to be called when needed
export async function cleanupOCR() {
    if (worker) {
        await worker.terminate();
        worker = null;
        console.log('OCR worker terminated');
    }
}

function createLoadingHandler() {
    const uploadSection = document.getElementById('upload-section');
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.textContent = 'Processing image...';
    
    return {
        start: () => uploadSection.appendChild(loadingElement),
        finish: () => loadingElement.remove()
    };
}
