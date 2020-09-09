const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/getAllPagesNames', (request, response) => {
  fs.readdir('./pages', (error, files) => {
    if (error) {
      console.error(error);
      response.send({ success: false });
    }
    else response.send({ success: true, body: files });
  });
});


const listener = app.listen(4242, () => {
  console.info(`Server is running on port ${listener.address().port}`);
});