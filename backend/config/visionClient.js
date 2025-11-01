// config/visionClient.js
const vision = require('@google-cloud/vision');
const path = require('path');

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'vision-key.json')
});

module.exports = client;
