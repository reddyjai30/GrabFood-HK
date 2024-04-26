const multer = require('multer');

const storage = multer.memoryStorage(); // Uses memory storage to handle file as buffer
const upload = multer({ storage: storage });

module.exports = upload;
