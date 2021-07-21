---
title: Adaptive Styling On the Modern Web
---
When I sat down to do the styling for this blog, my goal was to create a relatively lightweight setup that would be readable, accessible, and visually clean, taking advantage of CSS and user-agent features rather than relying on fancy UI components or a heavy JS framework. In this post I'll be talking a bit about the CSS features I used to do it, and why I'm reconsidering my attachment to CSS preprocessors for projects like this.

## CSS Variables and Page Themes

You see that little dark/light button at the bottom right corner of your screen? That's a theme toggle, baby, and it's *stupid simple* thanks to the magic of CSS variables ([Custom properties][css-custom-properties] and [`var()`][css-var], to be precise). They can do all kinds of cool stuff, from simple color storage so you can stop repeating the same hex code over and over again, to more advanced, dynamic uses enabled by their cascading nature. For as long as I've known about these, I've thought of page themes as an ideal demonstration of how powerful they can be. It's super simple to set up variables that change states based on an attribute of the `html` element:

```css
html {
	--background: white;
	--foreground: black;
	--header: red;
}
html[data-theme="dark"] {
	--foreground: white;
	--background: gray;
	--header: blue;
}
```

Because custom properties (the properties that start with `--`) cascade and inherit just like normal CSS properties, all the elements underneath `<html>` in the DOM will have the values of these properties set based on the `data-theme` attribute. Once you've got that set up, you only need to declare your other page styles once, in terms of the variables you just set:

```css
body {
	color: var(--foreground);
	background: var(--background);
}
header {
	background-color: var(--header);
}
```

Then, to see the theme in action, you just need a little Javascript to toggle the theme attribute:

```js
function toggleTheme () {
	const currentTheme = document.documentElement.getAttribute('data-theme');
	if (currentTheme === 'dark') {
		document.documentElement.setAttribute('data-theme', 'light');
	} else {
		document.documentElement.setAttribute('data-theme', 'dark');
	}
}
```

CSS variables let developers define theme properties all in one place, without the need for a preprocessor, and with support for switching theme based on pretty much any CSS selector. This flexibility being built into the language, filling a role that was long reserved for messy Webpack configurations in web apps, makes me legitimately excited to be writing plain, vanilla CSS again.

You'll also notice that this scheme allows for graceful degredation from the beginning. The script I presently have handling the theme toggle for this site, for example, adds the button it uses itself, so if Javascript is disabled or unsupported for some reason, the site still displays its default theme. What's more, I've added some [`prefers-color-scheme`][css-prefers-color-scheme] magic to make the default theme degrade into the user's OS theme, where available, whether scripts are enabled or not!

## Dynamic Sizing and Responsiveness

Responsive design is about more than just ensuring your content fits on phone screens. It's about optimizing the viewing experience so it feels appropriate for the viewing context. Phone screens don't have as much space for things like exaggerated headlines or wide margins, and while most modern CSS frameworks are designed with a "mobile-first" philosophy, they typically achieve this using rigid media queries that draw hard lines between "phone" and "tablet" and "laptop."

Personally, I prefer to do a bit more than hiding navigation menus behind hamburger icons when my site is being viewed from a phone. I want to match the density of the layout—text size, margin width, *everything*—to the size of the device presenting it. And to facilitate this, I've come up with a little helper I call the **expanding `rem`**. Here's what it looks like:

```css
:root {
	--expanding-rem: clamp(0rem, (100vw - 52rem) / 12, 1rem);
}
```

This line uses [`vw`][css-vw] units and the [`clamp()`][css-clamp] function to create a length value that scales up with page size. The idea behind this value is that it can be used to decrease the size of whitespace, headline text, etc. based on the size of the screen. In my case, screens less than 52 rem (around 800 pixels) wide have the smallest amount of whitespace, and sites more than 64rem (around 1000 pixels) have the most. Using `clamp()` ensures that the base value always stays between 0 and 1 rem, and when used in combination with `calc()`, it forms the basis of the responsive design of this site. Page headings and margins are scaled down on mobile devices so the content fits comfortably on the screen, while the overall layout is spaced more generously on desktops, where increased screen size affords more space to visual emphasis and clarity.

In order to use the unit, `calc()` is used to create lengths that scape proportionally to the expanding unit. If you want a length that scales between 0 and 2, instead of 0 and 1, just multiply it by 2. If you want a length that scales between 1 and 3, multiply by 2 and add 1. The math can seem tricky to work out at first, but pretty much any range you want can be expressed by a multiplication and an addition. Here's some examples:

```css
h1 {
	/* Vertical padding varies between 1rem and 3rem */
	margin: calc(2 * var(--expanding-rem) + 1rem) 0;
	/* Font size varies between 1.5 and 3 times larger than body font size */
	font-size: calc(1.5 * var(--expanding-rem) + 1.5rem);
}
```

I personally chose to use `rem` as the base unit for this layout, but this technique isn't limited to `rem` - in fact, it can be generically applied to basically any unit. For example, if you want to make a value that scales between 0 and 1px between the screen widths 400px and 800px, you could use the following to get your `--expanding-unit`:

```css
:root {
	--scale-width-min: 400px;
	--scale-width-max: 800px;
	--expanding-unit: clamp(0px, (100vw - var(--scale-width-min)) / (var(--scale-width-max) - var(--scale-width-min)), 1px);
}
```
I could go a lot more in depth about my thoughts on web design as a whole, and maybe I will in a future post. But for now I figured I would just highlight a couple of the things that make me excited about CSS and designing for the web, in a way I haven't been since I first started learning web technologies years ago. Hopefully this information is helpful!

[css-clamp]: https://developer.mozilla.org/en-US/docs/Web/CSS/clamp()
[css-custom-properties]: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
[css-prefers-color-scheme]: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
[css-var]: https://developer.mozilla.org/en-US/docs/Web/CSS/var()
[css-vw]: https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths
