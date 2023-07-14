---
title: User Styles
excerpt: Some of my personal CSS snippets that might also be useful for others
modified: 2022-01-25
---

Here's a stash of my user styles. Use [Stylus][stylus] (for [Firefox][stylus-firefox] or [Chrome/Edge/etc][stylus-chrome]) or another user style manager that supports `@preprocessor stylus`.

The scripts themselves are hosted [on GitHub][repo]. If you use these too and run into issues or think they could benefit from improvements, raise an issue or send a PR - I'd be happy to take a look.

[stylus]: https://add0n.com/stylus.html
[stylus-firefox]: https://addons.mozilla.org/en-GB/firefox/addon/styl-us/
[stylus-chrome]: https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne
[repo]: https://github.com/eritbh/userstyles

## Un-fuck Fandom

Gets rid of stupid crap from Fandom wikis, like the useless network navigation bar on the left and the ad bar in the bottom right. Has options for hiding lots of different things.

<a class="button userstyle-install" href="https://raw.githubusercontent.com/eritbh/userstyles/main/un-fuck-fandom.user.css">Install</a>

<div class="content-block">
	<div class="images">
		<a href="https://i.eritbh.me/3TJQdSMyLLt13.png"><img src="https://i.eritbh.me/3TJQdSMyLLt13.png"></a>
		<a href="https://i.eritbh.me/B6L3zFGAh8a15.png"><img src="https://i.eritbh.me/B6L3zFGAh8a15.png"></a>
		<a href="https://i.eritbh.me/Hq2ChidPepN18.png"><img src="https://i.eritbh.me/Hq2ChidPepN18.png"></a>
	</div>
</div>

## Un-fuck Amazon

Gets rid of stupid crap from Amazon, like the "there are things in your cart!" sidebar and various upsells on product pages. Has options for hiding lots of different things.

<a class="button userstyle-install" href="https://raw.githubusercontent.com/eritbh/userstyles/main/un-fuck-amazon.user.css">Install</a>

## Discord Custom Fonts

Lets you set custom body and code fonts for Discord. Also undoes dumb `font-weight` shenanigans that Discord sets up on light mode if you're on a standard-density monitor (because most fonts are designed to be readable in black-on-white on normal displays, you incompetent assholes).

<a class="button userstyle-install" href="https://raw.githubusercontent.com/eritbh/userstyles/main/discord-fonts.user.css">Install</a>

## Pinafore UI tweaks

Lets you set custom fonts, tweak the maximum width of the timeline, add backgrounds and word wrap to code display, and fixes non-wrapped code blocks with long lines being cut off and unscrollable horizontally.

<a class="button userstyle-install" href="https://raw.githubusercontent.com/eritbh/userstyles/main/pinafore-customization.user.css">Install</a>

## Compact Modmail User Info

Minimizes or removes the snoovatar in the user info sidebar of Reddit modmail.

<a class="button userstyle-install" href="https://raw.githubusercontent.com/eritbh/userstyles/main/compact-modmail-user-info.user.css">Install</a>

<div class="content-block">
	<div class="images">
		<a href="https://i.eritbh.me/brSuVkLigyyo3.png"><img src="https://i.eritbh.me/brSuVkLigyyo3.png"></a>
		<a href="https://i.eritbh.me/6XZsP239pJdo4.png"><img src="https://i.eritbh.me/6XZsP239pJdo4.png"></a>
	</div>
</div>

<script>
	document.addEventListener('readystatechange', function () {
		if (document.readyState != 'complete') {
			return;
		}

		const versionRegex = /==UserStyle==[\s\S]*@version\s+([^\n]+)[\s\S]*==\/UserStyle==/;
		for (const button of document.querySelectorAll('.userstyle-install')) {
			fetch(button.href)
				.then(response => response.text())
				.then(body => {
					let match = body.match(versionRegex);
					if (!match) {
						return;
					}

					let smallEl = document.createElement('small');
					smallEl.textContent = `v${match[1]}`;
					button.append(' ', smallEl);
				})
				.catch(error => {
					console.error(error);
				});
		}
	})
</script>
