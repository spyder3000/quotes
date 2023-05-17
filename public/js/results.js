const content = document.querySelector("#content");
const hideSection = document.querySelector("div.hidequotelines");
const hideImagesSection = document.querySelector("div.hideimages");
const imagemode_text = document.querySelector('span.imagemode'); 

var imageMode = false; 
var allQuotes;
var allQuoteFields = [];
var allImages;
var allImageFields = [];
var allItems; 		// will hold either quotes or images
var allItemFields = [];   // will hold either quotes or images
var pauseThis = false;
var numPauses = 0;
const qIndexes = {};
const basedelay = 8000;
var currIndex = 0;
var last_item_ind = false;    // indicates if Ajax call returns the last quote of the series (i.e. dont call Ajax for more quotes)

/* PAUSE functionality */
$("div.invisible_middle").click(function () {
	// console.log("click Pause -- currIndex = ", currIndex);
	if (!pauseThis) {
		numPauses += 1;
		$("#content .exitinfo").text(
			"[ PAUSED -- click to Resume;  lt-arrow/rt-arrow for Prev/Next ]"
		);
		$("#content .exitinfoMobile").text(
			"[ PAUSED -- click to Resume]"
		);
		$("div.left_arrow").removeClass("hideme");
		$("div.right_arrow").removeClass("hideme");
		$("#content .exitinfoMobile").removeClass("notvisible"); 
		$("#content .exitinfo").removeClass("notvisible"); 	
		pauseThis = !pauseThis;
		return;
	}

	$("#content .exitinfo").text(" ");
	$("#content .exitinfoMobile").text(" ");
	$("div.left_arrow").addClass("hideme");
	$("div.right_arrow").addClass("hideme");
	$("#content .exitinfoMobile").addClass("notvisible"); 
	$("#content .exitinfo").addClass("notvisible"); 

	if (currIndex + 1 >= allItemFields.length) {
		if (last_item_ind !== true) {
			ajaxMoreItems();
		}
		else {
			if (imageMode) {
				currIndex = 0;
				delay = 0; 
				setTimeout(startLoop, delay, allItemFields, currIndex, numPauses);
				// setItem(currIndex);				
			} 
		} 		
	} else {
		currIndex += 1;
		delay = 0; 
		setTimeout(startLoop, delay, allItemFields, currIndex, numPauses);
	}
	pauseThis = !pauseThis;
});

$(document).keydown(function(e) {
	if (pauseThis)  {
		if(e.keyCode == 37) { // left
			if (currIndex == 0) {
				return;
			}
			currIndex -= 1;
			setItem(currIndex);	
		}
		else if(e.keyCode == 39) { // right
			if (currIndex + 1 >= allItemFields.length) {
				if (last_item_ind !== true) {
					ajaxMoreItems('rt-click');
				}
				else {
					if (imageMode) {
						currIndex = 0;
						setItem(currIndex);				
					} 
				} 
				return; 
			}
			currIndex += 1;
			setItem(currIndex);
		}	
	}
});

$("div.left_arrow").click(function () {
	if (currIndex == 0) {
		return;	  // Begin of Array -- do nothing
	}
	currIndex -= 1;
	setItem(currIndex);
});

$("div.right_arrow").click(function () {
	if (currIndex + 1 >= allItemFields.length) {
		// console.log("END of ARRAY");
		if (last_item_ind !== true) {
			ajaxMoreItems('rt-click');
		}
		else {
			if (imageMode) {
				currIndex = 0;
				setItem(currIndex);				
			} 
		} 
		return; 
	}
	// Get next item in array
	currIndex += 1;
	setItem(currIndex);
});

/* START of process -- populates global array;  displays first quote;  calls Start of Loop  */
$(document).ready(function () {
	// console.log('imagemode_text = ', imagemode_text.innerText); 
	if (imagemode_text.innerText == 'imagemode') {
		imageMode = true;
		last_item_ind = true; 
	}

	setItemArray(); // populates allItemFields array

	// set various counters and indexes
	qIndexes.startIdx = parseInt(allItemFields[0].idx);
	qIndexes.endIdx =
		parseInt(allItemFields[allItemFields.length - 1].idx) + qIndexes.startIdx;
	qIndexes.maxCtr = allItemFields.length - 1;

	// Populate first quote shown
	setItem(qIndexes.startIdx);

	// special processing for 1st quote
	var delay = basedelay + (parseInt(allItemFields[0].extra) || 0);
	setTimeout(startLoop, delay, allItemFields, 1, numPauses); // start the loop with the 2nd item (index 1)
});

function ajaxMoreItems(action = '') {
	$.ajax({
		url: "/next",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ endIdx: qIndexes.endIdx }),
		success: function (response) {
			// console.log("AJAX return -- response = ", response);
			allItemFields = [];
			last_item_ind = response.counters.lastQuote; 

			if (imageMode) addNewImages(response.tenImages);
			else addNewQuotes(response.tenQuotes);
		
			if (action == 'rt-click') {
				currIndex = response.counters.curr; 
				setItem(currIndex);
			} else {
				startLoop(allItemFields, response.counters.curr, numPauses);
			}
		},
	});
}

/* Main Loop;  Sets indexes & starts Quotes Loop;  Fade effects & delays;  determines if Ajax for more quotes is needed */
function startLoop(ary, startIdx = 0, pNum) {
	// console.log('startLoop -- ary = ', ary); 
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
		setItem(idx, ary);
		$("#quote_section *").fadeIn(100);

		// your logic here, where you can update the delay
		delay = basedelay + (parseInt(ary[idx].extra) || 0);
		// console.log('mainloop delay = ', delay); 
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
	if (last_item_ind !== true) {
		ajaxMoreItems();
	} 
	else {
		if (imageMode) {
			currIndex = 0;
			startLoop(allItemFields, currIndex, numPauses);
		} 
	} 
}

/* set the main quote based on the index provided */
function setItem(idx, ary = allItemFields) {
	if (imageMode) {
		// console.log('Update image -- idx = ', idx, "; pics/" + ary[idx]["imagelink"])
		$("#image_section img").attr("src", "pics/" + ary[idx]["imagelink"]);
	} else {
		$("#quote_section .prequote").text(ary[idx]["prequote"]);
		// $("#quote_section .quote").text(ary[idx]["idx"] + " - " + ary[idx]["quote"]);
		$("#quote_section .quote").text(ary[idx]["quote"]);
		$("#quote_section .author").text(ary[idx]["author"]);
	}
}

/* From DOM hidden quotes, populate global allItemFields array w/ relevant info */
function setItemArray() {
	// console.log('setItemArray imageMode = ', imageMode); 
	if (imageMode) {
		allImages = hideImagesSection.querySelectorAll("div.hideimage");
		allImageFields = []; 
		for (i = 0; i < allImages.length; i++) {
			allImageFields[i] = {
				imagelink: allImages[i].querySelector("h2.hideimagelink").innerText,
				orig_idx: allImages[i].querySelector("h2.hide_orig_idx").innerText,
				idx: allImages[i].querySelector("h2.hide_idx").innerText,
			};
			allItemFields = allImageFields; 
		}	
		// console.log('AAA allImages = ', allImages); 
		// console.log('BBB allImageFields = ', allImageFields); 
	} else {
		allQuotes = hideSection.querySelectorAll("div.hidequoteline");
		allQuoteFields = []; 
		for (i = 0; i < allQuotes.length; i++) {
			allQuoteFields[i] = {
				prequote: allQuotes[i].querySelector("h2.hideprequote").innerText,
				quote: allQuotes[i].querySelector("span.hidequote").innerText,
				author: allQuotes[i].querySelector("h2.hideauthor").innerText,
				extra: allQuotes[i].querySelector("h2.hideextra").innerText,
				orig_idx: allQuotes[i].querySelector("h2.hide_orig_idx").innerText,
				idx: allQuotes[i].querySelector("h2.hide_idx").innerText,
			};
			allItemFields = allQuoteFields; 
		}
	}

}

/* After AJAX call, populate the Hidden Quotes DOM section w/ data from array */
function addNewQuotes(dat) {
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
	setItemArray();
}

/* Populate a single Hidden Quote Line in DOM (for use later) */
function copyQuotelineDiv(parent) {
	let tmp_div = parent.querySelector("div.hidequoteline");
	let copy_div = tmp_div.cloneNode(true); // true is for deep copy
	return copy_div;
}
