document.addEventListener('readystatechange', function () {
	if (document.readyState !== 'complete') {
		return;
	}

	const headings = document.querySelectorAll('h2, h3, h4, h5, h6');

	for (const heading of headings) {
		if (!heading.id) {
			continue;
		}

		const linkEl = document.createElement('a');
		linkEl.href = `#${encodeURIComponent(heading.id)}`;
		linkEl.classList.add('heading-link');
		linkEl.setAttribute('aria-label', 'Anchor');
		linkEl.setAttribute('title', 'Anchor to this heading')

		heading.prepend(linkEl);
	}
});
