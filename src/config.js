// Configuration for OCR settings
const config = {
    tesseractConfig: {
        lang: 'eng',
        logger: m => console.log(m)
    }
};

export function getConfig() {
    return config;
}
