const fs = require("fs");
const path = require("path"); // core node module (nodejs.org);  do not need to install via npm i xxx on cmd prompt
const express = require("express"); // express is a function (as opposed to an object);  see expressjs.com
const hbs = require("hbs");
const bodyParser = require("body-parser");

const LOOKBACK_TOTAL = 20;   // number of quotes prior to current selections to include (for left arrow select)

const app = express(); // creates a new express application
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
const port = process.env.PORT || 3000; // e.g. process environment var from heroku;  if running locally, will default to 3000

// DEfine paths for Express config;  __dirname is path to current directory;  path.join to go up one level & into public dir;
const publicDirectoryPath = path.join(__dirname, "../public"); // this line will match to public files first (e.g. index.html) prior to app.get stmts below
const viewsPath = path.join(__dirname, "../templates/views"); // express defaults to 'views' folder;  this modifies that to 'templates/views' instead
// const partialsPath = path.join(__dirname, "../templates/partials");

var currData = { category: "04" };


// Setup handlebars engine & views location
app.set("view engine", "hbs"); // e.g. set up a view engine (handlebar) for Express
app.set("views", viewsPath); // express default is 'views' folder for .hbs content;  this overrides that
// hbs.registerPartials(partialsPath);

// Setup static directory;  app.use to customize our server;
app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
	console.log('MATCH to index'); 
	res.render("index", {}); // allows us to render one of our views (one of the handlebar templates)
});

app.post("/begin", (req, res) => {
	// console.log("POST /begin", req.body); // '01' Onion, '03' Humor , '04' Literary, '05 Bible
	currData.quotes = readTextFile(req.body.quoteCategory);
	formatQuotes(1); // 1 is to 'randomize' the order;  0 is keep in order

	currData.ctr = 0;
	var tenQuotes = getSample();
	// console.log("tenquotes = ", tenQuotes);

	res.render("results", {
		tenQuotes,
		counters: {
			begin: 0,
			curr: 0,
			end: currData.ctr,
			lastQuote: currData.ctr >= currData.quotes.length - 1 ? true : false,
		},
	});
});

app.post("/next", (req, res) => {
	console.log("/next -- req.body = ", req.body); // '01' Onion, '03' Humor , '04' Literary, '05 Bible
	// let ctr = parseInt(req.body.endIdx);

	// currData.ctr = 0;
	console.log("Total quotes = ", currData.final.length);
	var tmp_ctr = currData.ctr; 
	var next_quotes = getSample();

	old_quotes = []; 
	if (tmp_ctr <= LOOKBACK_TOTAL) {
		begin_ctr = 0; 
		// old_quotes = currData.final.slice(0, tmp_ctr);
	} else {
		console.log('Subtract 20', tmp_ctr)
		begin_ctr = tmp_ctr - LOOKBACK_TOTAL; 
	}
	old_quotes = currData.final.slice(begin_ctr, tmp_ctr);
	console.log('old_quotes.length = ', old_quotes.length); 
	console.log('old_quotes.length = ', next_quotes.length); 
	var tenQuotes = old_quotes.concat(next_quotes); 
	console.log("tenquotes.length = ", tenQuotes.length);

	console.log('SEND -- curr = ', tmp_ctr, '; end = ', currData.ctr); 
	res.send({
		tenQuotes: tenQuotes, 
		counters: {
			begin: 0,
			curr: old_quotes.length, // tmp_ctr,
			end: currData.ctr,
			lastQuote: currData.ctr >= currData.final.length ? true : false,
		},
	});
});

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function formatQuotes(rand) {
	currData.final = [];
	for (let i = 0; i < currData.quotes.length; i++) {
		let x = currData.quotes[i].replace("\r", "");
		if (x.length == 0) continue;
		tmpobj = { extra: 0, orig_idx: i };
		let idx = currData.quotes[i].indexOf("++");
		if (idx >= 0) {
			tmpobj.extra = currData.quotes[i]
				.slice(idx + 2)
				.replace("\r", "")
				.replace("\n", "");
			x = x.substring(0, idx);
		}
		tmpobj.extra = parseInt(tmpobj.extra) * 2500;

		let segments = x.split("|");
		if (segments.length > 0) tmpobj.quote = segments[0];
		if (segments.length > 1) tmpobj.author = segments[1];
		tmpobj.idx = i;

		if (currData.category == "01") {
			var indx0 = tmpobj.quote.indexOf(":");
			tmpobj.prequote = "";
			if (indx0 > 0) {
				tmpobj.prequote = tmpobj.quote.substring(0, indx0 + 1);
				tmpobj.quote = tmpobj.quote.substring(indx0 + 1);
			}
		}
		currData.final.push(tmpobj);
	}

	// if (rand == 1) shuffleArray(currData.final);
	currData.final.forEach((element, index) => {
		currData.final[index].idx = index;
	});
}

function getSample() {
	var tmp_list = currData.final.slice(currData.ctr, currData.ctr + 3);
	if (currData.ctr + 3 > currData.final.length) currData.ctr = currData.final.length;
	else currData.ctr = currData.ctr + 3;
	return tmp_list;
}

// '01' Onion, '03' Humor , '04' Literary, '05 Bible
function readTextFile(str) {
	console.log("choice = ", str);
	try {
		currData.category = str;
		tmp_file = "files/famous2023.txt";
		if (str == "01") tmp_file = "files/onion2023.txt";
		else if (str == "03") tmp_file = "files/humor2023.txt";
		else if (str == "05") tmp_file = "files/bible2023.txt";
		// else if (str == "05") tmp_file = "files/dummy.txt";
		const dataBuffer = fs.readFileSync(tmp_file);
		const dataArray = dataBuffer.toString("UTF8").split("\n");
		return dataArray;
	} catch (e) {
		console.log("error e = ", e);
		return []; // returns an empty array (no data)
	}
}


// To start the server up;  access this via localhost:3000 URL
app.listen(port, () => {
	// port 3000 is default development port;  live HTML port is typically 80
	console.log("Server started on port " + port);
});
