const express = require ('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const path = require('path');

const app = express();
app.use(bodyParser.json());
console.log(__dirname);
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname + '/pages/index.html'));
    console.log("Requested!");
});

app.get("/resume/", (req, res) => {
    res.sendFile(path.resolve(__dirname + '/pages/resume.html'));
    console.log("Requested!");
});

app.listen(PORT, () => {
    console.log('listening on port ${PORT}!');
})