---
title: Dynamically Modifying Responses in Nginx
excerpt: Abusing server-side includes for fun (custom CSS for dockerized webapps) and profit (there actually is no profit, every part of this is terrible).
---
I self-host various services out of Docker containers, Among these services is a personal fediverse instance for myself. I wanted to customize the appearance of the instance, but I'm running software that doesn't have built-in support for custom CSS, and the actual CSS files being hosted are within the docker image where I can't easily access them. But I had time to kill today, so I decided to see what workarounds I could come up with.

My self-hosted stuff is accessible via an Nginx server which I use as a reverse proxy to the applications. My base configuration for the application looked something like this:

```nginx
# I have a DDNS setup pointed at my home IP, where the actual app is hosted
upstream myapp {
	server some.ddns.domain:3000;
}

server {
	# the domain the application can be accessed by
	server_name myapp.eritbh.me;
	listen 80;

	# all requests are redirected to the upstream (my home server)
	location / {
		proxy_pass http://myapp;
	}
}
```

That `location /` block tells Nginx what to do with all requests on the domain with paths falling under `/`; that is, all requests.

However, we can make more specific `location` directives which apply only to certain paths. For example:

```nginx
server {
	location = /assets/style.css {
		# only applies to this one path!
	}
	location / {
		# applies to everything else
	}
}
```

You can start to see where I'm going with this - we can use a `location =` block to intercept requests for a stylesheet loaded by the web app and have it return something else instead. We can, for example, put a custom stylesheet file in `/var/www/myapp/custom-style.css` and serve that instead:

```nginx
location = /assets/style.css {
	alias /var/www/myapp/custom-style.css
}
```

This gets us a lot! We can grab the application's stylesheet from the web inspector and paste it into this file, make whatever tweaks we want, and then our modified version of the file will be served back to users instead of the original.

However, I wasn't fully satisfied with this solution. I have my docker containers set up to automatically pull updates, and a system like this won't work very well if the original version of the stylesheet changes in an update. Rather than having to manually transplant my tweaks into every new version of the upstream file, I'd like to just have some additional CSS that gets appended to the end of the stylesheet's normal contents.

The starting point for figuring this out was [this StackOverflow answer](https://stackoverflow.com/a/33616307/1070107) which introduced me to [Server Side Includes](http://nginx.org/en/docs/http/ngx_http_ssi_module.html). SSI is basically a simple templating language built into Nginx which enables us to do some dynamic stiching together of files and additional requests when writing HTTP responses.

SSI allows us to do stuff like this:

```nginx
server {
	location /something {
		return 200 "hello!";
	}
	location /otherthing {
		return 200 "goodbye!";
	}
	location /both {
		# enable SSI
		ssi on;
		# allow SSI to work regardless of MIME type, not just in HTML
		ssi_types *; #
		return 200 '
			<!--# include file="/something" -->
			<!--# include file="/otherthing" -->
		';
	}
}
```

Then, if you hit `/both` in your browser, you should get a response that looks like:

```
hello!
goodbye!
```

This is powerful enough to power some simple HTML sites, and you can tell from the `include` directive syntax that it's meant to work in HTML. But, by using the `ssi_types *` directive, we can use it with any other filetype to concatenate the responses of two routes back to back - exactly what we need if we want to put some custom CSS on the end of an existing stylesheet.

But there's a wrinkle here: We want the user to be sent our modified version of the app's stylesheet, but we still need to get the original version in order to append our modifications to it, and we can't use its original path anymore since that would just be a never-ending recursive mess. Is there a clean way to include the original file contents in our SSI template?

Well, I don't know if the solution I came up with counts as "clean", but here it is: an internal route (one that can't be hit from the outside, only from within Nginx) which manually `proxy_pass`es back to the original path on the upstream application. We also set up another path which reads our additional CSS from a local file so it can be appended. The whole thing looks something like this:

```nginx
upstream myapp {
	server some.ddns.domain:3000;
}

server {
	# the domain the application can be accessed by
	server_name myapp.eritbh.me;
	listen 80;

	# override the stylesheet route to return our custom content
	location = /assets/style.css {
		# enable SSI templating
		ssi on;
		# use SSI outside HTML
		ssi_types *;
		# concatenate the original stylesheet and our additional CSS
		return 200 '
			<!--# include file="/assets/style.css/_original" -->
			<!--# include file="/assets/style.css/_additions" -->
		';
	}

	# internal route which returns the original stylesheet from the upstream
	location = /assets/style.css/_original {
		# this route is inaccessible from the outside - only used via SSI
		internal;
		# use proxy_pass to get the file contents directly from the upstream
		proxy_pass http://myapp/assets/style.css;
	}

	# internal route which returns our additional CSS to append
	location = /assets/style.css/_additions {
		internal;
		# load from a local file
		alias /var/www/myapp/custom-style.css;
	}

	# all other requests are still proxied to the upstream
	location / {
		proxy_pass http://myapp;
	}
}
```

I feel like there has to be a better way to do something like this, but this is already such a hacky thing to want to do that I don't really feel super motivated to make it better.

One more detail: If the HTTP server running under your Docker image is configured to respond with gzipped response bodies, the Nginx SSI module doesn't seem to bother unpacking compressed responses before passing them through to SSI. You may have to do something like this to prevent your application from sending compressed responses when requesting assets which you want to use in a templated response:

```nginx
location = /assets/style.css/_original {
	internal;
	proxy_pass http://myapp/assets/style.css;
	# this header prevents the upstream from using response compression
	proxy_set_header Accept-Encoding "identity";
}
```

This entire endeavour is incredibly cursed, and the further in the more cursed I got. For your own sake, I hope that you never encounter a situation where any of this knowledge is useful!
