var app = require('electron').remote;
var dialog = app.dialog; // dialog boxes .. don't need
const database = require('./js/database');

// should be able to set these in the yet to be added Preferences section
//showComments = false;
firstNumberEntriesLoad = 10;
numberEntriesLoad = 8; 


window.onload = function() {

	writeEntry();

	// Populating the stream
	function fillStream() {
	db.count({}).exec(function (err, count) {
			if (count < firstNumberEntriesLoad) { // if number entries in database that havent loaded < number to load
				var toLoad = count;
			} else {
				var toLoad = firstNumberEntriesLoad;
				}
		database.getEntries(function(entries) {
			var streamSpace = '';
			for (i=0; i<toLoad; i++) { // originally (i=0; i<entries.length; i++)
				streamSpace += database.formatEntries(entries[i]);
			}
			//document.getElementById('stream').innerHTML = "";
		document.getElementById('stream').innerHTML = streamSpace;
		}); 
	});
	}

	fillStream(); 

	// Getting highlight text and saving quotes - should only be active if in stream mode, need a confirm page 
	function gText(e) {
	var t = '';
    t = window.getSelection();
    var quoteContent = t.toString();
    if (t.getRangeAt(0).startContainer.parentNode.parentNode.parentNode.id == 'stream') {
	    if (t.getRangeAt(0).startContainer.parentNode.parentNode.id == t.getRangeAt(0).endContainer.parentNode.parentNode.id) {
		    if (quoteContent != "") {
		    	if (confirm('Want to add this quote?')) {
		    	var id = t.getRangeAt(0).startContainer.parentNode.parentNode.id; //gives id of container
		    	database.addQuote(id, quoteContent);
		    		}
			    }
			}
		}
    }
	document.onmouseup = gText;
	if (!document.all) document.captureEvents(Event.MOUSEUP);

}

function ifNotNullRemove (el) {
	if (document.getElementById(el) != null ){
		document.getElementById(el).remove();
		}
	}

function deleteEntry(element) {
		var id = element.parentNode.parentNode.id; // getting the id of the post
		document.getElementById(id).remove();
		database.deleteEntry(id);
		// on click delete button -> removes from the entry from the stream (getelementbyid)
		// finds the entry in the database and remvoves it
		}

function editEntry(element) {
	// if there's a comment being written elsewhere and you want to edit, bye to the commnt
	if (document.getElementById('tempComment')!=null) {
	document.getElementById('tempComment').remove();
		}
	// if there's another edit being made ... save it? or just revert ... just revert or do nothing who cares
	// if (document.getElementById('tempEdit')!=null) {}

	var entryForButton = element.parentNode.parentNode.firstChild.nextSibling; // getting text of that entry
	var id = element.parentNode.parentNode.id; 
	var entryEditable = '<textarea id="tempEdit">'+ entryForButton.innerText + '</textarea>' ;
	entryForButton.innerHTML = entryEditable;
	var keys = {}; // http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
	onkeydown = onkeyup = function editEntry(e) {
		keys[e.keyCode] = e.type == 'keydown';
	if (document.getElementById('tempEdit') === document.activeElement) {
		if ((keys[91]|| keys[93]) && keys[13]) {
		var content = document.getElementById('tempEdit');
		if (content.value !== "") { //if the entry's not empty, do this
				alert(content.value); 
				database.editEntry(id, content.value); 
			} 
		var content = content.value.replace(/(\r\n|\n|\r)/gm, '<br />');
		entryForButton.innerHTML = '<div class="entry-content">'+content+'</div>'; 
		}
		}
	};
	
}

// need an event that calls this -- on click or onmouseover?
function clientSearch() {
	var searchText = document.getElementById('searchInput');
		if (searchText === document.activeElement) {
			var keys = {}; // http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
			onkeydown = onkeyup = function editEntry(e) {
			keys[e.keyCode] = e.type == 'keydown';
				if (keys[13]) {
					if (searchText.value !== "") {
				var toSearch = searchText.value; // working
					// try an alternate version w/o colons? or lowe it still 
					database.search(toSearch);
					}
				} 
			};
	}
				// db.find ... according to ... then load those according to chronological 
				// have a clear search button  or text that reloads the normal stream 
					// doc getelbyid search stream, search stream.innerhtml = "", call fillstream
}

// Comments 
function clientAddComment(element) {
	var entryCommenting = element.parentNode.parentNode;
	var id = element.parentNode.parentNode.id; 
	// see if there isn't already one comment or edit being written; if so, end that - one thing@time
	if (document.getElementById('tempComment')!=null || document.getElementById('tempEdit'!=null)) {
		ifNotNullRemove('tempComment');
		ifNotNullRemove('tempEdit');
	}
	// see if there's already comment data - load the comments
	//if (db.find({ _id:id}, ))
	var commentAlready = ""; 
	var commentSpace = '<textarea id="tempComment">'+commentAlready+'</textarea>';
	entryCommenting.innerHTML = entryCommenting.innerHTML + commentSpace;
	document.getElementById('tempComment').focus(); 
	var keys = {}; // http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
	onkeydown = onkeyup = function editEntry(e) { // globalize this and above and below line
		keys[e.keyCode] = e.type == 'keydown';
	if (document.getElementById('tempComment') === document.activeElement) {
		if ((keys[91]|| keys[93]) && keys[13]) {
		var comment = document.getElementById('tempComment');
		if (comment.value !== "") {
				alert(comment.value);
				// EDIT THE COMMENT VALUE TO REMOVE ANY trailing spaces
				database.addComment(id, comment.value); 
			} 
		var commentContent = comment.value.replace(/(\r\n|\n|\r)/gm, '<br />');
		comment.remove();
		entryCommenting.innerHTML = entryCommenting.innerHTML + ('<div class="comment"><div class="commentText">'+commentContent
			+'</div><div><button onclick="clientEditComment(this)">Edit Comment</button> <button onclick="clientDeleteComment(this)">Delete Comment</button></div>'
			+'</div>'); 
			}
		}
	};
}

function clientEditComment(element) {
	var id = element.parentNode.parentNode.parentNode.id;
	var commentContent = element.parentNode.parentNode.firstChild; 
	var commentEditable = '<textarea id="tempEdit">'+ commentContent.innerHTML + '</textarea>';
	var oldComment = commentContent.innerText;
	commentContent.innerHTML = commentEditable;
	var keys = {}; // http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
	onkeydown = onkeyup = function editEntry(e) {
		keys[e.keyCode] = e.type == 'keydown';
	if (document.getElementById('tempEdit') === document.activeElement) {
		if ((keys[91]|| keys[93]) && keys[13]) {
		var commContent = document.getElementById('tempEdit');
		if (commContent.value !== "") { //if the entry's not empty, do this
				alert(commContent.value); 
				database.editComment(id, oldComment, commContent.value); 
			} 
		var commContent = commContent.value.replace(/(\r\n|\n|\r)/gm, '<br />');
		commentContent.innerHTML = '<div class="commentText">'+commContent+'</div>'; 
			}
		}
	};
}

function clientDeleteComment(element) {
	var id = element.parentNode.parentNode.parentNode.id;
	var commentContent = element.parentNode.parentNode.firstChild.innerHTML; 
	alert(commentContent);
	database.deleteComment(id, commentContent); 
	element.parentNode.parentNode.remove(); 
}

function addToStream(location) {
	db.count({}).exec(function (err, count) {
		var onScreen = document.querySelectorAll(location).length;
			if ((count-onScreen) < numberEntriesLoad) { // if number entries in database that havent loaded < number to load
				var numToUpdate= count-onScreen;
			} else {
				var numToUpdate = numberEntriesLoad+onScreen;
				}
		database.getEntries(function(entries) {
			var toAdd = "";
			for (i=onScreen; i<numToUpdate; i++) { // originally (i=0; i<entries.length; i++)
				toAdd = toAdd + database.formatEntries(entries[i]);
			}
				document.getElementById('stream').innerHTML = document.getElementById('stream').innerHTML + toAdd;
		}); 
	});
}

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) { // you're at the bottom of the page
    	addToStream('#stream .entry'); 
    }
};

function writeMode() {
	ifNotNullRemove('quote-stream'); 
	ifNotNullRemove('stream'); 
	ifNotNullRemove('topbar');
	ifNotNullRemove('search-stream');
	document.getElementById('write-entry-content-id').focus();
}

function quoteMode() {
	document.getElementById('stream').remove();
	ifNotNullRemove('search-stream');
	var quoteStream = ""; 
	database.getEntries(function(entries) {
		for (i=0; i<2; i++) { // the issue is db length again, write a function for it 
			if (entries[i].quotes.length>0) {
			quoteStream = quoteStream + database.formatQuotes(entries[i]);
			}
		}
	document.getElementById('quote-stream').innerHTML = quoteStream;  // this is sth I ran into before, this has to be 
	// inside the database.function so that it still has meaning when referenced
	// it's a scope issue
	});
}

// Updating the stream
function updateStream() {
	database.getEntries(function(entries) {
	var newEntry = database.formatEntries(entries[0]); 
	var strream = document.getElementById('stream'); 
	// fast way of prepending, since += appends -- document.getElementById('stream').innerHTML += newEntry;
	strream.innerHTML = newEntry + strream.innerHTML;
	});
}

function writeEntry() {
	if (document.getElementById('write-entry-content-id') === document.activeElement) {
	var keys = {}; // http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
	onkeydown = onkeyup = function submitEntry(e) {
		keys[e.keyCode] = e.type == 'keydown';
		if ((keys[91]|| keys[93]) && keys[13]) {
		var content = document.getElementById('write-entry-content-id'); //using the id tag
			if (content.value !== "") { //if the entry's not empty, do this
				alert(content.value); 
				database.addEntry(content.value); 
			} 
		content.value = ""; // Resetting the input field
		updateStream(); 
			}
		};
	}}
/*
function showEntryOptions (element) {
	var footer = element.firstChild.nextSibling.nextSibling;
	footer.style.display = "block";
	element.style.backgroundColor = "blue !important";

}*/