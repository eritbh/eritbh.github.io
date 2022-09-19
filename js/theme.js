const LOCALSTORAGE_KEY = 'theme'

const getBrowserTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const getStoredTheme = () => localStorage.getItem(LOCALSTORAGE_KEY);

let themeToggleButton = document.querySelector('.theme-button');
let themeResetButton = null;

document.addEventListener('readystatechange', () => {
	if (document.readyState !== 'complete') {
		return;
	}

	themeToggleButton = document.querySelector('.theme-button');
	updatePageTheme();
})

function createThemeResetButton () {
	if (themeResetButton || !themeToggleButton) {
		return;
	}
	themeResetButton = document.createElement('button');
	themeResetButton.classList.add('theme-button', 'theme-reset-button');
	themeResetButton.setAttribute('title', 'Reset to browser/system theme');
	themeResetButton.setAttribute('aria-label', 'Reset to browser/system theme');
	themeResetButton.addEventListener('click', () => {
		resetTheme();
	});
	themeToggleButton.after(themeResetButton);
}

function removeThemeResetButton () {
	if (!themeResetButton) {
		return;
	}
	themeResetButton.remove();
	themeResetButton = null;
}

// set theme based on previous state or OS/browser setting
function updatePageTheme () {
	const storedTheme = getStoredTheme();
	document.documentElement.setAttribute('data-theme', storedTheme || getBrowserTheme());
	if (storedTheme != null) {
		createThemeResetButton();
	} else {
		removeThemeResetButton();
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
