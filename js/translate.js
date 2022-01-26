// detect google translate lang direction classes and adapt accordingly
let observer = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		if (mutation.attributeName !== 'class') {
			return;
		}

		if (mutation.target.classList.contains('translated-rtl')) {
			document.documentElement.dir = 'rtl';
		} else if (mutation.target.classList.contains('translated-ltr')) {
			document.documentElement.dir = 'ltr';
		}
	}
});
observer.observe(document.documentElement, {attributes: true});

// add dir=ltr to all pre and code elements since those need to stay literal
document.addEventListener('readystatechange', () => {
	if (document.readyState !== 'complete') {
		return;
	}

	for (const el of document.querySelectorAll('pre, code')) {
		el.dir = 'ltr';
	}
});
