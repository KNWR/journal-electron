# Journal: An experiment in electron

A small journal app in javascript, via the Electron framework.

The main goal here was to make it as easy and intuitive as possible to write an entry, and then as clear and simple as possible to read them back. This is unfinished, and I don't see myself touching it for the foreseeable future. Hacking around with Electron was fun.

Design inspiration from Zwitter, Apple's Terminal interface, and Twitter. The idea is to be totally honest with yourself (vs. the signalling that happens on Twitter as a social environment), and to reflect honestly later. 

## Room for Improvement: Design (UI/UX)

For writing code, there's DRY (don't repeat yourself) - I'd borrow from Zen Mind, Beginner's Mind to add a principle for design, at least here: nothing extra.  The buttons look ugly, and get in the way of the main idea (simplicity and total focus on the writing or reading of entries).

Done over, I would hide the buttons on the bottom of the posts (comment, edit, etc.) except on mouseover, or if an entry's command clicked on. They would look better as vertically stacked icons on the side of an entry. Perhaps there'd be a light grey mini-menu icon that would appear on mouseover, and when clicked, the three icons on the side could drop down from it.

Also, it would be neat to rewrite the front end in React or vue, just to play with those.

## Room for Improvement: Code

If I were to fix up the code from this project, the two main things I would change would be: (1) implementing the DRY (don't repeat yourself) principle by having writing a function for the key command code, which is repeated several times and (2) making the database.js and index.js code more modular and standardizing it so that any db.function() functions were kept within and exported from the database.js file. The fillStream() function in index.js is just one example where this doesn't happen.