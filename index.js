const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 2300;

// Set storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve the index.html file with the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const fileType = req.body.fileType;

  if (fileType === 'csv') {
    parseCSV(filePath, res);
  } else if (fileType === 'json') {
    parseJSON(filePath, res);
  } else {
    res.status(400).send('Invalid file type specified');
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  res.send(`<h2>File Contents:</h2><pre>${fileContent}</pre>`);
});

function parseCSV(filePath, res) {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.send({
        fileContent: results,
        fields: Object.keys(results[0]) // Extract field names from the first row
      });
    });
}

function parseJSON(filePath, res) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  const fields = Object.keys(jsonData[0]);
  
  res.send({
    fileContent: jsonData,
    fields: fields
  });
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});