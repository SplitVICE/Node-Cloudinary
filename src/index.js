// When requiring dotenv, CLOUDINARY_URL environment variable is automatically loaded
require('dotenv').config();

// Express web application initializer
const express = require('express');
const app = express();

// File uploading directory
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'multer/'))) fs.mkdirSync(path.join(__dirname, 'multer/'));

// =======================================================================================
// CLOUDINARY SETTINGS
// =======================================================================================

const cloudinary = require('cloudinary').v2;
console.log(cloudinary.config().cloud_name); // Prints cloud name on console if set correctly

// =======================================================================================

// ============================================================================================
// MULTER SETTINGS
// ============================================================================================
const multer = require('multer');

const multer_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'multer'))
    },
    filename: (req, file, cb) => {
        cb(null, (() => { return file.originalname; })())
    },
});

const upload = multer({
    storage: multer_storage,
    limits: { fileSize: 30000000 }, // 30MB file limit
    fileFilter: (req, file, cb) =>{
        // To filter files to it here
        // https://www.npmjs.com/package/multer#filefilter
    }
});
// ============================================================================================

// --------------------------------------------------------------------------------------
// Route settings

// Single file upload route
app.post('/api/upload/single', upload.single('file'), async (req, res) => {
    // Uploads image onto Cloudinary. Stores Cloudinary response on variable
    //const cloudinary_response = await cloudinary.uploader.upload(req.file.path);

    fs.unlinkSync(req.file.path); // deletes temporal image

    res.json({ cloudinary_response });
});

// Multiple file upload route
app.post('/api/upload/multiple', upload.array('files'), async (req, res) => {
    const cloudinary_responses = [];

    for (let i = 0; i < req.files.length; i++) {
        cloudinary_responses.push(await cloudinary.uploader.upload(req.files[i].path));

        fs.unlinkSync(req.files[i].path); // deletes temporal image
    }

    res.json(cloudinary_responses);
});

// HTML example route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

// --------------------------------------------------------------------------------------
// Server start
const port = process.env.PORT || 8080;
app.listen(port, () => { console.log(`Node Cloudinary running on port ${port}`); });