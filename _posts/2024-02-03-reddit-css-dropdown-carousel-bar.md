---
title: Building Dropdowns and a Message Carousel Into a Subreddit Stylesheet
excerpt: Do you want to make custom interactive components for your forum, but you get almost no control over the DOM? Do I ever have the CSS hack for you, powered by the a markdown parser and a dream.
---
*This post is an annotated source walkthrough of an infobar with link dropdowns
and a rotating message carousel, which you can integrate into your subreddit's
CSS theme. It's based around [the implementation I wrote in Sass][sass-impl] for
[/r/anime][r-anime], though this is a pure CSS example. The raw source is also
available [with annotations in comments][src-ann] or [with just the code][src].*

*If this explanation helps you, consider buying me a pizza or an energy drink or
something by [donating on Ko-Fi][kofi]!*

[sass-impl]: https://github.com/r-anime/stylesheet/blob/main/src/_infobar.scss
[r-anime]: https://old.reddit.com/r/anime
[src-ann]: https://archive.eritbh.me/reddit-carousel-dropdown-bar-annotated.css
[src]: https://archive.eritbh.me/reddit-carousel-dropdown-bar.css
[kofi]: https://ko-fi.com/eritbh

---

Start by making some space at the top of the page for the bar to live:
```css
body > .content {
	padding-top: 40px;
}
```

Now. The sidebar markdown text should start with something that looks like this:

```md
> - Scrolling message one
> - Scrolling message two
> - Scrolling message three
> - Scrolling message four
>
> **Category**
> *[Link](...) [Link](...) [Link](...)*
>
> **Category**
> *[Link](...) [Link](...) [Link](...)*
>
> **Category**
> *[Link](...) [Link](...) [Link](...)*
```

We'll assume that this large quote block that everything is wrapped in is the
first item in the sidebar, so we'll target it with `.side .md > :first-child`.
First order of business is to move it out of the sidebar and into the space we
cleared for it:

```css
.side .md > :first-child {
	position: absolute;
	top: 65px;
	left: 0;
	right: 310px;
	height: 40px;
	margin: 0;
}
```

Next, we'll set this up as a flex container to get the stuff inside this bar in
a row rather than a column. More styling can also be added here; let's include a
hideous debug background:

```css
.side .md > :first-child {
	display: flex;
	background: lightgreen;
}
```

The first set of list items in our block is for the message carousel. We can
target the list using `.side .md > :first-child > :first-child`. First, let's do
some basic spacing and style resets and limit the height of the carousel to the
height of the bar we've made. We'll also give it an obnoxious background for
debugging:

```css
.side .md > :first-child > :first-child {
	margin: 0;
	padding: 0;
	list-style: none;
	height: 100%;
	background: orange;
}
```

Next, we'll move it to the right end of the bar and tell it to take up as much
room as possible:

```css
.side .md > :first-child > :first-child {
	order: 99;
	flex-grow: 1;
}
```

Finally, we'll set it up to hide any elements that overflow outside its bounds,
and set up a column flexbox layout for its children. We'll use this to
dynamically reorder the inner elements as part of the rotation animation, which
we'll get to in a moment.

```css
.side .md > :first-child > :first-child {
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
```

We also need to set each item's size to match the bar's size, so only
one is shown at a time. We'll use `box-sizing: border-box` to ensure that
the height we set here accounts for any padding or borders you might add to
these elements later; for now we'll just give it a debug border.

```css
.side .md > :first-child > :first-child li {
	flex: 0 0 40px;
	box-sizing: border-box;
	border: 1px solid black;
}
```

The actual animation of these items is probably the trickiest part of this whole
thing. We set up some animation keyframes called "reorder" which we'll apply to
each individual item. This animation will apply a negative top margin to each
item to scroll it up and make room for the next item, then freeze for a little
bit, then repeat again to move the next item into position. Once the last item
is shown, the first item then needs to be reordered underneath so it can come in
from the same direction and continue the loop.

There's a lot of math involved in setting the keyframes up so that the delay
length and the animation length look right - tweak these percentages as
appropriate for how you want it to look, and if you want more or less than four
items in your bar, you'll need to add additional stages to account for that.

```css
@keyframes reorder {
```

Start in the visible position and stay static for a while. The second percentage
here controls how long we wait static before starting to animate; increase this
percentage to increase the amount of time held. It should stay higher than 25%
since that's when the animation has to be done.

```css
	0%, 20% {
		margin-top: 0;
		order: 0;
	}
```

By just before the next cycle, we'll be at a negative margin-top to move us up
out of view and make way for the next item.

```css
	24.999% {
		margin-top: -40px;
		order: 0;
	}
```

At 25%, we've fully cycled out of view. We now jump down to the bottom of the
list via order, and reset our negative margin; the next item is positioned
perfectly, and we can wait at the bottom until it's our turn to cycle into view
again.

```css
	25%, 49.999% {
		margin-top: 0;
		order: 3;
	}
```

At 50% there's another stage for someone else to be in view - there's now a
different item at the bottom and we adjust our order up a spot.

```css
	50%, 74.999% {
		order: 2;
	}
```

At 75% the fourth item is in view and we're directly underneath it, and at the
end we should be right back where we started.

```css
	75%, 99.999% {
		order: 1;
	}

	to {
		margin-top: 0;
		order: 0;
	}
}
```

Now. The key to this animation hackery is that we apply this animation to every
individual message in the infobar, but each one is delayed by exactly 1/4 the
full cycle duration (if you're using 5 slots, you'd change this to be 1/5, etc).
This means that exactly one of these elements is animating itself into the
`order: 0` position at a time, and whichever element is in that position handles
moving all the elements at once by setting the negative top margin on itself and
allowing the others to flow up after it.

```css
.side .md > :first-child > :first-child li {
	animation: reorder 20s infinite;
}
```

So we've set `20s` as the time for a full cycle. The first item has no delay;
each successive item gets `20s`/4 = `5s`` more delay than the last:

```css
.side .md > :first-child > :first-child li:nth-child(2) { animation-delay: 5s }
.side .md > :first-child > :first-child li:nth-child(3) { animation-delay: 10s }
.side .md > :first-child > :first-child li:nth-child(4) { animation-delay: 15s }
```

Okay!! That's the hard part done! Now we just want to make the bar pop out to
show all the items when it's hovered, by making it tall enough for all items to
be shown at once...

```css
.side .md > :first-child > :first-child:hover {
	height: 400%;
}
```

...and also pause all the animations so items don't move around underneath
someone's cursor if they're trying to select the text or click a link.

```css
.side .md > :first-child > :first-child:hover li {
	animation-play-state: paused;
}
```

OKAY. We're done with the fancy message carousel now. Let's move on to the
dropdowns. As a reminder, we have some markdown in our sidebar that looks like:

```md
> - Scrolling message one
> - Scrolling message two
> - Scrolling message three
> - Scrolling message four

> **Category**
> *[Link](...) [Link](...) [Link](...)*

> **Category**
> *[Link](...) [Link](...) [Link](...)*

> **Category**
> *[Link](...) [Link](...) [Link](...)*
```

Note that the paragraph breaks in here are significant - when this markdown is
parsed, we'll have a `<p>` element for each dropdown, where each contains a
`<strong>` for the button label (the bit wrapped in `**`) and an `<em>` which
contains all the links (the bit wrapped in `*`).

First we'll reset the spacing of the wrapping `p` element, and we'l give it
`position: relative` so we can use absolute positioning on its children to move
them around relative to this container rather than relative to the page:

```css
.side .md > :first-child > p {
	margin: 0;
	position: relative;
}
```

Then we can style the button label however we want:

```css
.side .md > :first-child > p strong {
	display: block;
	height: 40px;
	margin-right: 10px;
	background: pink;
}
```

Now we start dealing with the actual dropdown contents. We're gonna use
`position: absolute`, like we mentioned before, to have this sit just underneath
the button label. We'll also set a `width` so the links can fit without
wrapping; though if you *do* want text wrapping then you can also use a normal
pixel value for `width` instead of the `max-content` keyword. Finally we'll
include `z-index: 1` to make sure the dropdown is rendered over the top of some
other Reddit elements which are badly behaved.

```css
.side .md > :first-child > p em {
	display: block;
	position: absolute;
	z-index: 1;
	top: 40px;
	width: max-content;
	background: yellow;
}
```
And we can style the links inside however we want now:
```css
.side .md > :first-child > p em a {
	display: block;
	margin: 5px;
	background: aquamarine;
}
```

Finally, hide the dropdown unless it's being hovered:
```css
.side .md > :first-child > p:not(:hover) em { display: none }
```

And you're done! At this point everything is functional and you'll want to go
back through and replace my shitty debugging styles with something that actually
looks nice. You can also experiment with adding additional elements in some
places if you want - for example, /r/anime uses italics/`<em>` in the message
carousel to split messages into a title and a subtitle, and additional
bold/`<strong>` tags within the dropdown `em`s to add section dividers in our
filter selector. You can do a lot with this base as long as you maintain the
same basic nesting structure.
