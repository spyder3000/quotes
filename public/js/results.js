// console.log("Results.js JavaScript file is loaded!");

const content = document.querySelector("#content");
const hideSection = document.querySelector("div.hidequotelines");
var allQuotes;
var allQuoteFields = [];
var pauseThis = false;
var numPauses = 0;
const qIndexes = {};
const basedelay = 8000;
var currIndex = 0;
var last_quote_ind = false;    // indicates if Ajax call returns the last quote of the series (i.e. dont call Ajax for more quotes)

/* PAUSE functionality */
$("div.invisible_middle").click(function () {
	// console.log("click Pause -- currIndex = ", currIndex);
	if (!pauseThis) {
		numPauses += 1;
		$("#content .exitinfo").text(
			"[ PAUSED -- click to Resume;  lt-arrow/rt-arrow for Prev/Next ]"
		);
		$("div.left_arrow").removeClass("hideme");
		$("div.right_arrow").removeClass("hideme");
		pauseThis = !pauseThis;
		return;
	}

	$("#content .exitinfo").text("");
	$("div.left_arrow").addClass("hideme");
	$("div.right_arrow").addClass("hideme");
	if (currIndex + 1 >= allQuoteFields.length) {
		if (last_quote_ind !== true) {
			ajaxMoreQuotes();
		}
	} else {
		currIndex += 1;
		delay = 0; 
		setTimeout(startLoop, delay, allQuoteFields, currIndex, numPauses);
	}
	pauseThis = !pauseThis;
});

$("div.left_arrow").click(function () {
	if (currIndex == 0) {
		// console.log("BEGIN of ARRAY");
		return;
	}
	currIndex -= 1;
	// console.log("click Left2 , currIndex = ", currIndex);
	setQuote(currIndex);
});

$("div.right_arrow").click(function () {
	// console.log("click RT2 -- currIndex = ", currIndex, allQuoteFields.length);
	if (currIndex + 1 >= allQuoteFields.length) {
		// console.log("END of ARRAY");
		if (last_quote_ind !== true) {
			ajaxMoreQuotes('rt-click');
		}
		return; 
	}

	currIndex += 1;
	setQuote(currIndex);
});

/* START of process -- populates global array;  displays first quote;  calls Start of Loop  */
$(document).ready(function () {
	setQuoteArray(); // populates allQuoteFields array

	// set various counters and indexes
	qIndexes.startIdx = parseInt(allQuoteFields[0].idx);
	qIndexes.endIdx =
		parseInt(allQuoteFields[allQuoteFields.length - 1].idx) + qIndexes.startIdx;
	qIndexes.maxCtr = allQuoteFields.length - 1;

	// Populate first quote shown
	setQuote(qIndexes.startIdx);

	// special processing for 1st quote
	var delay = basedelay + parseInt(allQuoteFields[0].extra);
	// console.log("WW01 -- startLoop called from Ready");
	setTimeout(startLoop, delay, allQuoteFields, 1, numPauses); // start the loop with the 2nd item (index 1)
});

function ajaxMoreQuotes(action = '') {
	$.ajax({
		url: "/next",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ endIdx: qIndexes.endIdx }),
		success: function (response) {
			// console.log("AJAX return -- response = ", response);
			allQuoteFields = [];
			last_quote_ind = response.counters.lastQuote; 
			addNewQuotes(response.tenQuotes);
			if (action == 'rt-click') {
				currIndex = response.counters.curr; 
				setQuote(currIndex);
			} else {
				startLoop(allQuoteFields, response.counters.curr, numPauses);
			}
		},
	});
}

/* Main Loop;  Sets indexes & starts Quotes Loop;  Fade effects & delays;  determines if Ajax for more quotes is needed */
function startLoop(ary, startIdx = 0, pNum) {
	// Logic here (& elsewhere) prevents loop from continuing or if this was called prior to pause button event
	if (pauseThis) return;
	if (pNum !== numPauses) return;

	var idx = startIdx;
	currIndex = idx;
	mainLoop(ary, idx, pNum);
}

function mainLoop(ary, idx, pNum) {
	if (pauseThis) return;
	if (pNum !== numPauses) return;
	$("#quote_section .prequote").fadeOut(1000);
	$("#quote_section .quote").fadeOut(1000);
	$("#quote_section .author").fadeOut(1000, function () {
		currIndex = idx;
		setQuote(idx, ary);
		$("#quote_section *").fadeIn(100);

		// your logic here, where you can update the delay
		delay = basedelay + parseInt(ary[idx].extra);
		// console.log( "delay", delay, "; idx = ", idx, "; ary length = ",
		// 	ary.length, "; quote index = ", ary[idx].idx, ary[idx].quote );
		idx += 1;

		if (pauseThis) return;
		if (idx == ary.length) {
			setTimeout(waitFn, delay, numPauses);
			return;
		}
		setTimeout(mainLoop, delay, ary, idx, numPauses);
	});
}

/* No more quotes in current Array, so call AJAX, process quotes, & start new loop of quotes */
function waitFn(pNum) {
	if (pauseThis) return;
	if (pNum !== numPauses) return;
	if (last_quote_ind !== true) {
		ajaxMoreQuotes();
	}
}

/* set the main quote based on the index provided */
function setQuote(idx, ary = allQuoteFields) {
	// console.log('setQuote', idx, allQuoteFields); 
	$("#quote_section .prequote").text(ary[idx]["prequote"]);
	// $("#quote_section .quote").text(ary[idx]["idx"] + " - " + ary[idx]["quote"]);
	$("#quote_section .quote").text(ary[idx]["quote"]);
	$("#quote_section .author").text(ary[idx]["author"]);
}

/* From DOM hidden quotes, populate global allQuoteFields array w/ relevant info */
function setQuoteArray() {
	allQuotes = hideSection.querySelectorAll("div.hidequoteline");
	for (i = 0; i < allQuotes.length; i++) {
		allQuoteFields[i] = {
			prequote: allQuotes[i].querySelector("h2.hideprequote").innerText,
			quote: allQuotes[i].querySelector("span.hidequote").innerText,
			author: allQuotes[i].querySelector("h2.hideauthor").innerText,
			extra: allQuotes[i].querySelector("h2.hideextra").innerText,
			orig_idx: allQuotes[i].querySelector("h2.hide_orig_idx").innerText,
			idx: allQuotes[i].querySelector("h2.hide_idx").innerText,
		};
	}
}

/* After AJAX call, populate the Hidden Quotes DOM section w/ data from array */
function addNewQuotes(dat) {
	// console.log("addNewQuotes", dat);
	let tmp_cont = document.querySelector("div.hidequotelines");
	let copy_div = copyQuotelineDiv(tmp_cont);

	tmp_cont.innerHTML = "";

	for (let i = 0; i < dat.length; i++) {
		new_div = copy_div.cloneNode(true);
		new_div.querySelector(".hidequote").innerText = dat[i].quote;
		new_div.querySelector(".hideauthor").innerText = dat[i].author;
		new_div.querySelector(".hideextra").innerText = dat[i].extra;
		new_div.querySelector(".hide_orig_idx").innerText = dat[i].orig_idx;
		new_div.querySelector(".hide_idx").innerText = dat[i].idx;
		tmp_cont.append(new_div);
	}
	setQuoteArray();
}

/* Populate a single Hidden Quote Line in DOM (for use later) */
function copyQuotelineDiv(parent) {
	let tmp_div = parent.querySelector("div.hidequoteline");
	let copy_div = tmp_div.cloneNode(true); // true is for deep copy
	return copy_div;
}
