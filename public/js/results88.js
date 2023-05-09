console.log("Results.js JavaScript file is loaded!");
// const startDisplay = document.querySelector("#startQuotes");

const content = document.querySelector("#content");
const hideSection = document.querySelector("div.hidequotelines");
var allQuotes;
var allQuoteFields = [];
var pauseThis = false;
var numPauses = 0;
const qIndexes = {};
const basedelay = 8000;
var currIndex = 0;

/* PAUSE functionality */
$("div.invisible_middle").click(function () {
	console.log("click Pause -- currIndex = ", currIndex);
	if (!pauseThis) {
		numPauses += 1;
		$("#content .exitinfo").text(
			"[ PAUSED -- click to Resume;  lt-arrow/rt-arrow for Prev/Next ]"
		);
		$("div.left_arrow").removeClass("hideme");
		$("div.right_arrow").removeClass("hideme");
	} else {
		$("#content .exitinfo").text("");
		$("div.left_arrow").addClass("hideme");
		$("div.right_arrow").addClass("hideme");
		if (currIndex + 1 >= allQuoteFields.length) {
			alert("need to call AJAX for more quotes");
			return;
		}
		currIndex += 1;
		delay = basedelay + parseInt(allQuoteFields[currIndex].extra);
		console.log("WW00 -- startLoop called from UnPause");
		setTimeout(startLoop, delay, allQuoteFields, currIndex, numPauses);
	}
	pauseThis = !pauseThis;
});

$("div.left_arrow").click(function () {
	console.log("click Left, currIndex = ", currIndex);
	if (currIndex == 0) {
		console.log("BEGIN of ARRAY");
		return;
	}
	currIndex -= 1;
	console.log("click Left2 , currIndex = ", currIndex);
	$("#quote_section .prequote").text(allQuoteFields[currIndex]["prequote"]);
	$("#quote_section .quote").text(
		allQuoteFields[currIndex]["idx"] +
			" - " +
			allQuoteFields[currIndex]["quote"]
	);
	$("#quote_section .author").text(allQuoteFields[currIndex]["author"]);
});
$("div.right_arrow").click(function () {
	console.log("click Right", currIndex);
	console.log("click RT2 -- currIndex = ", currIndex, allQuoteFields.length);
	if (currIndex + 1 >= allQuoteFields.length) {
		console.log("END of ARRAY");
		return;
	}

	currIndex += 1;
	$("#quote_section .prequote").text(allQuoteFields[currIndex]["prequote"]);
	$("#quote_section .quote").text(
		allQuoteFields[currIndex]["idx"] +
			" - " +
			allQuoteFields[currIndex]["quote"]
	);
	$("#quote_section .author").text(allQuoteFields[currIndex]["author"]);
});

/* START of process -- populates global array;  displays first quote;  calls Start of Loop  */
$(document).ready(function () {
	setQuoteArray(); // populates allQuoteFields array

	// set various counters and indexes
	qIndexes.startIdx = parseInt(allQuoteFields[0].idx);
	qIndexes.endIdx =
		parseInt(allQuoteFields[allQuoteFields.length - 1].idx) + qIndexes.startIdx;
	qIndexes.maxCtr = allQuoteFields.length - 1;
	//jv			startIdx = (startIdx + offset) % slideCache.length;

	// Populate first quote shown
	$("#quote_section .prequote").text(
		allQuoteFields[qIndexes.startIdx]["prequote"]
	);
	// $("#quote_section .quote").text(allQuoteFields[qIndexes.startIdx]["quote"]);
	$("#quote_section .quote").text(
		allQuoteFields[qIndexes.startIdx]["idx"] +
			" - " +
			allQuoteFields[qIndexes.startIdx]["quote"]
	);
	$("#quote_section .author").text(allQuoteFields[qIndexes.startIdx]["author"]);

	// special processing for 1st quote
	var delay = basedelay + parseInt(allQuoteFields[0].extra);
	// allQuoteFields.shift(); // remove this first item from array
	console.log("WW01 -- startLoop called from Ready");
	setTimeout(startLoop, delay, allQuoteFields, 1, numPauses); // start the loop with the 2nd item (index 1)
});

/* Main Loop;  Sets indexes & starts Quotes Loop;  Fade effects & delays;  determines if Ajax for more quotes is needed */
function startLoop(ary, startIdx = 0, pNum) {
	console.log("startLoop -- pauseThis = ", pauseThis, startIdx);
	// Logic here (& elsewhere) prevents loop from continuing or if this was called prior to pause button event
	if (pauseThis) return;
	if (pNum !== numPauses) return;

	var idx = startIdx;
	currIndex = idx;
	console.log("startLoop Begin", currIndex);
	mainLoop(ary, idx, pNum);

	/*
	(function loop(ary) {
		if (pauseThis) return;
		console.log("loop() call -- pause = ", pauseThis);
		$("#quote_section .prequote").fadeOut(1000);
		$("#quote_section .quote").fadeOut(1000);
		$("#quote_section .author").fadeOut(1000, function () {
			currIndex = idx;
			console.log("fadeout -- currIndex = ", currIndex);
			$("#quote_section .prequote").text(ary[idx]["prequote"]);
			$("#quote_section .quote").text(
				ary[idx]["idx"] + " - " + ary[idx]["quote"]
			);
			$("#quote_section .author").text(ary[idx]["author"]);
			$("#quote_section *").fadeIn(100);

			// your logic here, where you can update the delay
			delay = basedelay + parseInt(ary[idx].extra);
			console.log(
				"delay",
				delay,
				idx,
				ary.length,
				ary[idx].idx,
				ary[idx].quote
			);
			// idx = (idx + 1) % ary.length;
			idx += 1;

			if (pauseThis) return;
			if (idx == ary.length) {
				setTimeout(waitFn, delay);
				return;
			}
			setTimeout(loop, delay, ary);
		});
	})(ary);  */
}

function mainLoop(ary, idx, pNum) {
	if (pauseThis) return;
	if (pNum !== numPauses) return;
	console.log("loop() call -- pause = ", pauseThis);
	$("#quote_section .prequote").fadeOut(1000);
	$("#quote_section .quote").fadeOut(1000);
	$("#quote_section .author").fadeOut(1000, function () {
		currIndex = idx;
		console.log("fadeout -- currIndex = ", currIndex);
		$("#quote_section .prequote").text(ary[idx]["prequote"]);
		$("#quote_section .quote").text(
			ary[idx]["idx"] + " - " + ary[idx]["quote"]
		);
		$("#quote_section .author").text(ary[idx]["author"]);
		$("#quote_section *").fadeIn(100);

		// your logic here, where you can update the delay
		delay = basedelay + parseInt(ary[idx].extra);
		console.log("delay", delay, idx, ary.length, ary[idx].idx, ary[idx].quote);
		// idx = (idx + 1) % ary.length;
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
	console.log("waitfn");
	if (pauseThis) return;
	if (pNum !== numPauses) return;

	$.ajax({
		url: "/next",
		type: "POST",
		contentType: "application/json",
		// data: JSON.stringify({ "viewedProfiles": viewedProfiles }),
		data: JSON.stringify({ endIdx: qIndexes.endIdx }),
		success: function (response) {
			console.log("success", response.tenQuotes);
			allQuoteFields = [];
			addNewQuotes(response.tenQuotes);
			// console.log("ZZ startLoop", allQuoteFields);
			if (pauseThis) return;

			console.log("WW02 -- startLoop called from UnPause");
			startLoop(allQuoteFields, 0, numPauses);
			// console.log("ZZ return startloop");
		},
	});
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
	console.log("better array", allQuoteFields);
}

/* After AJAX call, populate the Hidden Quotes DOM section w/ data from array */
function addNewQuotes(dat) {
	console.log("addNewQuotes", dat);
	let tmp_cont = document.querySelector("div.hidequotelines");
	let copy_div = copyQuotelineDiv(tmp_cont);

	tmp_cont.innerHTML = "";

	console.log("dat.length = ", dat.length);
	for (let i = 0; i < dat.length; i++) {
		new_div = copy_div.cloneNode(true);
		// copy_div.querySelector(".hideprequote").innerText = "aaa";
		new_div.querySelector(".hidequote").innerText = dat[i].quote;
		new_div.querySelector(".hideauthor").innerText = dat[i].author;
		new_div.querySelector(".hideextra").innerText = dat[i].extra;
		new_div.querySelector(".hide_orig_idx").innerText = dat[i].orig_idx;
		new_div.querySelector(".hide_idx").innerText = dat[i].idx;
		tmp_cont.append(new_div);
		console.log("new div = ", new_div);
		console.log("tmp div = ", tmp_cont);
	}
	console.log("final div = ", tmp_cont);
	setQuoteArray();
}

/* Populate a single Hidden Quote Line in DOM (for use later) */
function copyQuotelineDiv(parent) {
	let tmp_div = parent.querySelector("div.hidequoteline");
	let copy_div = tmp_div.cloneNode(true); // true is for deep copy
	return copy_div;
}

// OLDER logic -- ignore
/*
function request88(qCtr, run) {
	// console.log("request BEGIn");
	$("#quote_section .prequote").fadeOut(1000);
	$("#quote_section .quote").fadeOut(1000);
	$("#quote_section .author").fadeOut(1000, function () {
		qCtr = (qCtr + 1) % allQuoteFields.length;
		$("#quote_section .prequote").text(allQuoteFields[qCtr]["prequote"]);
		// $("#quote_section .quote").text(allQuoteFields[qCtr]["quote"]);
		$("#quote_section .quote").text(
			allQuoteFields[qCtr]["idx"] + " - " + allQuoteFields[qCtr]["quote"]
		);

		$("#quote_section .author").text(allQuoteFields[qCtr]["author"]);
		$("#quote_section *").fadeIn(100);
		// console.log("clearInterval");
		clearInterval(run);
		console.log("current & max ctr = ", qCtr, qIndexes.maxCtr);
		interval = 8000 + parseInt(allQuoteFields[qCtr]["extra"]);
		// console.log("interval ", qCtr, " = ", interval);
		if (qCtr == qIndexes.maxCtr) {
			run = setInterval(wait, interval);
			console.log("END of Loop");
		} else run = setInterval(request, interval);
	});
}

function wait88() {
	console.log("wait");
	$.ajax({
		url: "/next",
		type: "POST",
		contentType: "application/json",
		// data: JSON.stringify({ "viewedProfiles": viewedProfiles }),
		data: JSON.stringify({ endIdx: qIndexes.endIdx }),
		success: function (response) {
			console.log("success", response.tenQuotes);
			console.log("success");
			console.log("clearinterval 2");
			allQuoteFields = [];
			addNewQuotes(response.tenQuotes);
			clearInterval(run);
		},
	});
	console.log("clearinterval 2");
	clearInterval(run);
}

*/
