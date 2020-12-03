// set theme based on previous state or OS/browser setting
document.documentElement.setAttribute(
	'data-theme',
	localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
);

// toggles the theme
function toggleTheme (theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark') {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
}

// add theme toggle button to the page (not in static HTML so it doesn't show up for clients with JS disabled)
document.write('<button class="theme-button" aria-label="Toggle theme" title="Toggle theme" onclick="toggleTheme()"></button>');
