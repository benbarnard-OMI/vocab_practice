const config = {
    visionApiKey: process.env.VISION_API_KEY || '',
    ocrMethod: process.env.OCR_METHOD || 'in-browser',
};

function getConfig() {
    return config;
}

module.exports = {
    getConfig,
};
