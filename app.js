const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require("http-errors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

// Set storage engine with dynamic path from request
const storage = multer.memoryStorage();

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }
  // fileFilter: (req, file, cb) => {
  //   checkFileType(file, cb);
  // },
}).single('file'); // Single file upload

// Check file type function (optional)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// Route to upload file with dynamic path
app.post('/upload/file/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err });
    } else {
      if (req.file === undefined) {
        res.status(400).send({ message: 'No file selected!' });
      } else {
        // Define the destination path
        const uploadPath = req.body.uploadPath || 'uploads/';
        const filePath = path.join(uploadPath, req.file.originalname);

        // Ensure the directory exists
        fs.mkdirSync(uploadPath, { recursive: true });

        // Move the file from memory to the destination
        fs.writeFile(filePath, req.file.buffer, (err) => {
          if (err) {
            res.status(500).send({ message: 'Error saving the file!' });
          } else {
            res.send({
              message: 'File uploaded and saved successfully!',
              file: filePath,
            });
          }
        });
      }
    }
  });
});

app.use(function(req, res, next) {
  console.error('404 error handler', req.path);
  next(createError(404));
});


// Start server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});