---
title: User Styles
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
