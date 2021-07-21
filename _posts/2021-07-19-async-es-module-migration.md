---
title: Moving Old Asynchronous Systems to ES6 Modules
---
I think ES modules are an awesome addition to Javascript. They allow static analysis across files, allowing for things like tree shaking and making VS Code's Intellisense feature even more useful for large projects. However, I've been working to bring these advantages to an older codebase, and it presented some challenges that I haven't had in other projects; I thought I'd document my findings here.

This project is a browser extension that's built without any bundling or dependency management, because it doesn't really have any dependencies. I really like writing native Javascript without transpiling or bundling, but in order to make a maintainable system before modules were available in all browsers, the codebase relied heavily on adding properties to the global object that are referenced from other files. On the surface, converting this structure to a module-based system seems easy—identify all the global properties added by various files, convert them to exports, import the file wherever those values are needed, and call it a day. However, modules do have one major difference from normal objects that prevents this from working: Module exports can't be reassigned asynchronously. Once the module is executed synchronously, from top to bottom, any other reassignments from within promises, callbacks, or timeouts won't be seen by any other file importing it.

```js
// a.js
let foo = 1;
setTimeout(() => { foo = 2; }, 100);
export {foo};

// b.js
import {foo} from './a.js';
setTimeout(() => { console.log(foo); }, 200);
// Output: 1 (not 2!)
```

The code I'm working on doesn't just assign constants and functions to the global object, it also stores application state there, and references it a *lot*. On startup, for example, the extension checks if you're on a specific website, and if you are, tries to detect your account's username. This is done asynchronously, so an exported value can't be used here, but I still want to have a statically exported way to obtain that value from elsewhere, without having to change up consumer code too much.

```js
// util.js
// Wait a second to let the page fully load
setTimeout(() => {
	// Store the user's username 
	window.username = document.getElementById('user-menu').textContent;
}, 1000)

// contentScript.js
// When the submit button is clicked, handle it specially
let submitButton = document.getElementById('input[type=submit]');
submitButton.addEventListener('click', event => {
	event.preventDefault();
	console.log(window.username);
});
```

The obvious solution would be to use promises, but a typical async function won't quite cut it - you don't want to wait a full second *every time* a different part of the content script needs access to the user's username! It's a value that you only need to compute once, when the page loads, and it should be immediately available after that every time. How can we accomplish this?

Well, it turns out you don't need a function at all - this is a good use case for constructing and exporting a promise directly. Here's the module-oriented solution I came up with:

```js
// util.js
export const username = new Promise(resolve => {
	// Wait a second to let the page fully load
	setTimeout(() => {
		// Resolve with the user's username
		let username = document.getElementById('user-menu').textContent;
		resolve(username);
	}, 100);
});

// contentScript.js
import {username} from './util.js';
// When the submit button is clicked, handle it specially
let submitButton = document.getElementById('input[type=submit]');
submitButton.addEventListener('click', async event => {
	event.preventDefault();
	console.log(await username);
});
```

See how that works? A promise is the same object even when it resolves, so the same object will be imported every time someone requests the username, and if it's already been retrieved from the page, there's no wait necessary - the promise caches its resolution value for us, and we can `await` it at any time to retrieve it without a perceptible delay.

The downside of this method is that for a large project, you may have a lot of refactoring to do in order to incorporate promises in what once were assumed to be "synchronous" bits of code. However, this is actually an advantage of using promises for tasks like this—they force you to acknowledge that code using them is not guaranteed to have a return value immediately. It can cause a lot of churn, and I really did try to find a "synchronous" workaround that would mean less manual conversion, but eventually I realized that the spec prevents you from modifying exports in order to prevent the exact same class of asynchronous bugs that asynchronous structures like callbacks and promises are designed to prevent. In the end, ES6 modules ended up being the feature that pushed me to modernize a large chunk of our codebase, and the project will be better for it.
