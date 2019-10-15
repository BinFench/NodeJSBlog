const express = require ('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const path = require('path');
const fs = require('fs');
const sd = require('showdown');

postNames = [];
renderedPosts = [];
numPosts = 0;
isReversed = false;

converter = new sd.Converter();

fs.readdirSync(__dirname + '/blog/').forEach(file => {
    postNames.push(file.substring(4));
	numPosts += 1;
	contents = fs.readFileSync(__dirname + '/blog/' + file, 'utf8');
	renderedPosts.push(converter.makeHtml(contents));
});

postNames = postNames.reverse();
//renderedPosts = renderedPosts.reverse();

const app = express();
app.use(bodyParser.json());
console.log(__dirname);
app.use(express.static(__dirname));

app.set('views', __dirname + '/views/');
app.set('view engine', 'pug');

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname + '/pages/index.html'));
    console.log("Requested!");
});

app.get("/resume/", (req, res) => {
    res.sendFile(path.resolve(__dirname + '/pages/resume.html'));
    console.log("Requested!");
});

app.get("/blog/*", (req, res) => {
	if (req.originalUrl.substring(6) == "") {
		postNum = 0;
	}
	
	else {
		postNum = parseInt(req.originalUrl.substring(6), 10);
	}
	
	if (postNum > numPosts - 1 || postNum < 0) {
	res.sendFile(path.resolve(__dirname + '/pages/error.html'));
    }
    
	else {
		res.render('blog', 
		{postTitle: postNames[numPosts], posts: postNames, numPosts: numPosts, post: renderedPosts[postNum]});
    }
});

app.get("/*", (req, res) => {
	res.sendFile(path.resolve(__dirname + '/pages/error.html'));
    console.log("Requested!");
});

app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
})
