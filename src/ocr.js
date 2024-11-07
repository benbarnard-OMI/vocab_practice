import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imageFile) {
    try {
        const result = await Tesseract.recognize(imageFile, 'eng', {
            logger: (m) => console.log(m),
        });
        return result.data.text;
    } catch (error) {
        console.error('OCR error:', error);
        throw new Error('Failed to extract text from image');
    }
}
