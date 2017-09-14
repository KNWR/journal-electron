var Datastore = require('nedb');
db = new Datastore({ filename: 'db/entries.db', autoload: true, timestampData: true });


exports.addEntry = function(content) {
	var contentTagged = content.toLowerCase();
		contentTagged = contentTagged.replace(/\s{2,}/g," ");
		contentTagged = contentTagged.split(" ");
		contentTagged = contentTagged.filter(function(word) {return word.includes("@");});
		// Create entry object
		var entry = {
			"content": content, 
			//date: new Date(), // might not need given timestamp option of nedb
			"tags": contentTagged,
			"quotes": [],
			"comments": []
		};

		db.insert(entry, function(err, newDoc) {
			// Do nothing
		}); 
	}; 


// Returns all entries
exports.getEntries = function(fnc) {

  // Get all persons from the database
  db.find({}).sort({createdAt: -1}).exec(function(err, docs) {

    // Execute the parameter function
    fnc(docs);
  });
}


// Formats entries into HTML
// ready to be added into document

exports.formatEntries = function(entr) {
	var monthNames = [
	"January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
	];
	var date = entr.createdAt;
	var day = date.getDate();
	var monthIndex = date.getMonth(); 
	var year = date.getFullYear(); 
	var dateFormed = day + ' ' + monthNames[monthIndex] + ' ' + year; 

	// add line breaks
	var content = entr.content;
	content = content.replace(/(\r\n|\n|\r)/gm, '<br />');

	//format entry

		// considering: adding a footer that shows up on mouseover 
	if (entr.comments.length > 0) { // fixes comment-caused clumping
		var formatted = '<div class="entry" id="'+ entr._id + '" onclick="showEntryOptions(this)">'
		+ '<div class="entry-date">' + dateFormed + '</div><div class="entry-content">'
		+ content + '</div><footer class="entry-footer">'
		+ '<button class="edit-btn" onclick="editEntry(this)">Edit</button>'
		+'<button class="comment-btn" onclick="clientAddComment(this)">Comment</button>'
		+'<button class="delete-btn" onclick="deleteEntry(this)">Delete</button>'
		+'</footer>';
			var commentHTML = ""; 
		// this is being called inside another loop (addToStream) so we use a diff index
		// counter variable, here l, there i
		for (l=0; l<entr.comments.length; l++) {
			commentHTML = commentHTML + '<div class="comment"><div class="commentText">'
				+ entr.comments[l]
				+'</div><div><button onclick="clientEditComment(this)">Edit Comment</button> <button onclick="clientDeleteComment(this)">Delete Comment</button></div>'
				+'</div>';
		}
		formatted = formatted+commentHTML+'</div>'; 
	} else { // if no comments
		var formatted = '<div class="entry" id="'+ entr._id + '" onclick="showEntryOptions(this)">'
			+ '<div class="entry-date">' + dateFormed + '</div><div class="entry-content">'
			+ content + '</div><footer class="entry-footer">'
			+ '<button class="edit-btn" onclick="editEntry(this)">Edit</button>'
			+'<button class="comment-btn" onclick="clientAddComment(this)">Comment</button>'
			+'<button class="delete-btn" onclick="deleteEntry(this)">Delete</button>'
			+'</footer></div>';
	}

	return formatted; 
}

exports.formatQuotes = function(entr) {
	var monthNames = [
	"January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
	];
	var date = entr.createdAt;
	var day = date.getDate();
	var monthIndex = date.getMonth(); 
	var year = date.getFullYear(); 
	var dateFormed = day + ' ' + monthNames[monthIndex] + ' ' + year; 

	var qContent = entr.quotes; 
	qContent = qContent.toString().replace(/(\r\n|\n|\r)/gm, '<br />');

	var qFormatted = '<div class="quote-entry" id ="Q' + entr._id+'">'
	+ '<div class="entry-date">' + dateFormed + '</div><div class="quote-entry-content">'
	+ qContent + '</div></div>';
	return qFormatted;
}

exports.addQuote = function(id, quoteContent) {
	db.update({ _id: id}, {$push: {quotes:quoteContent}}, {}, function() {
	});
}

exports.editEntry = function (id, editContent) {
	db.update({ _id: id}, {$set: {content: editContent}}, {multi: false}, function (err, numReplaced) {});
	var tags = editContent.toLowerCase();
		tags = tags.replace(/\s{2,}/g," ");
		tags = tags.split(" ");
		tags = tags.filter(function(word) {return word.includes("@");});
	db.update({ _id: id}, {$set: {tags: tags}}, {multi: false}, function (err, numReplaced) {});
}

// exports.removeQuote

exports.addComment = function(id, commentContent) {
	db.update({ _id: id}, {$push: {comments:commentContent}}, {}, function() {
	});
}

exports.deleteComment = function (id, commentContent) {
	db.findOne({_id: id}, function (err, doc) {
		var indexToRemove = doc.comments.indexOf(commentContent);
		doc.comments.splice(indexToRemove, 1);  // this isn't acting on the actual array in the database.... var creates a copy
		var newDocComments = doc.comments;

 // OR create a "newarray" and set that 
  db.update({ _id: id }, { $set: {comments: newDocComments} }, {}, function () { 
  		});
	});
}

exports.editComment = function (id, oldComment, newComment) {
	db.findOne({_id: id}, function (err, doc) {
		var indexToEdit = doc.comments.indexOf(oldComment/*+" "*/);
		doc.comments[indexToEdit] = newComment; 
		var newDocComments = doc.comments;
		db.update({ _id: id }, { $set: {comments: newDocComments} }, {}, function () { 
  			});
	});
}

exports.deleteEntry = function(id) {

 db.remove({ _id: id }, {}, function(err, numRemoved) {
    // Do nothing
  });
}

// Search 
exports.search = function(queries) {
	var queries = queries.toLowerCase();
	queries = queries.split(", ");
	// db - want this to be AND w/ the tags, has to include all of whatever's there -- 
	if (queries.length > 1) {
	var qstring = "{$and: [{";
	var qstringAddn = "";
	for (i=0; i<queries.length; i++){
		qstring = qstring+"content: /"+ queries[i] +'/}, {';
	}
	qstring = qstring.slice(0,-3);
	qstring = qstring+']}';
	}
	else { // if just one search tag 
		qstring = queries;
	}
	alert(qstring);
	db.find({tags: qstring}).sort({createdAt: -1}).exec(function(err, docs) {
		var toAdd = "";
		alert(docs.length);
		for (i=0; i<docs.length; i++) { // originally (i=0; i<entries.length; i++)
			toAdd = toAdd + database.formatEntries(docs[i]);
			}
		if (docs.length == 0) { 
			document.getElementById('stream').style.display="none";
			document.getElementById('search-stream').innerHTML = "Nothing found.";
			setTimeout(function (){document.getElementById('search-stream').innerHTML = "";;
				document.getElementById('stream').style.display="block";}, 1500);
			} else {
				document.getElementById('search-stream').innerHTML = "";
				document.getElementById('stream').style.display="none";
				document.getElementById('search-stream').innerHTML = document.getElementById('search-stream').innerHTML + toAdd;
		}
	});
}