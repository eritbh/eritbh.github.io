const LOCALSTORAGE_KEY = 'theme'

const getBrowserTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const getStoredTheme = () => localStorage.getItem(LOCALSTORAGE_KEY);

// set theme based on previous state or OS/browser setting
function updatePageTheme () {
	const storedTheme = getStoredTheme();
	document.documentElement.setAttribute('data-theme', storedTheme || getBrowserTheme());
	if (storedTheme) {
		document.documentElement.setAttribute('data-local-theme', '');
	} else {
		document.documentElement.removeAttribute('data-local-theme');
	}
}

// toggles the theme
function toggleTheme (theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark') {
	localStorage.setItem(LOCALSTORAGE_KEY, theme);
	updatePageTheme();
}

// deletes stored theme data and reverts to the browser/system setting
function resetTheme () {
	localStorage.removeItem(LOCALSTORAGE_KEY);
	updatePageTheme();
}

updatePageTheme();
