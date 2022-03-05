---
title: WebDAV Custom File Uploader in ShareX
excerpt: Fastmail dropped support for FTP file uploads, so I updated my ShareX workflow to use WebDAV instead.
---

Fastmail, my email provider, also offers file storage and simple public hosting of uploaded files. Until recently, it also allowed you to interface with your files via FTP. With these two things, it was trivial to set up ShareX, my Windows screenshot utility of choice, to automatically upload my screenshots to my custom domain for use in chat rooms and the like. But with the sunset of the Fastmail FTP interface, my upload settings stopped working. Fastmail still maintains a WebDAV interface, so I migrated my uploader to use that instead. Here's what I learned.

WebDAV is actually super neat - it basically lets you send normal HTTP calls to interact with and modify files on the remote server. Stackoverflow illustrates that uploading a file with WebDAV is as easy as can be on the command line:

    curl -T file https://my.server/path/to/file

ShareX lets you set up custom uploaders that hit HTTP routes, so this should be easy. I couldn't find any particular example of a generic WebDAV custom uploader, but I figured it out. You can use `https://my.server/path/to/$filename$` as the request URL, and ShareX will fill in the filename for you. Then, `curl -T` against an HTTP/S server just means to use `PUT` and pass the file as the request body, which we can accomplish by setting our ShareX uploader's request method to "PUT" and setting the body upload option to "Binary".

Talking with Fastmail's servers also requires user/password authentication, typically using an application-specific password instead of your actual account password. You can use `curl --user user:pass` to send authentication on the command line; internally, this base64 encodes the `user:pass` string and sets the `Authorization` header to `Basic <that>`. [MDN describes this in more detail](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme). Fortunately, ShareX also has a helper for base64 encoding things, so we can set `Authorization: Basic $base64:USER:PASS$` and call it a day. If your WebDAV server requires a different authentication scheme, you'll have to change the value of that header accordingly.

With Fastmail, I host my screenshots on a custom domain out of a specific folder in my file storage. ShareX has the ability to copy the uploaded image's public URL after it's uploaded, and to support that we just need to tell it where to look after upload. In my case it's pretty simple: images get uploaded to my `Screenshots` folder and show up at the top of `https://i.eritbh.me`, so I set up the ShareX uploader's "URL" setting as `https://i.eritbh.me/$filename$`. You may need something different depending on where your uploaded files are publically available.

The full uploader template [can be downloaded here](https://archive.eritbh.me/WebDAVUploader.sxcu), and it looks like this:

    {
        "Version": "13.7.0",
        "Name": "WebDAV File Uploader",
        "DestinationType": "None",
        "RequestMethod": "PUT",
        "RequestURL": "https://your.server/path/to/$filename$",
        "Headers": {
            "Authorization": "Basic $base64:USER:PASS$"
        },
        "Body": "Binary",
        "URL": "https://your.public.server/path/to/$filename$"
    }

Entering stuff manually in the ShareX custom uploader editor, it'll look like this:

![Screenshot of ShareX custom uploader settings as specified above](https://i.eritbh.me/GNqZqVkgCZd57.png)

Hopefully this helps if, like me, you're googling for "WebDAV ShareX uploader" and not finding any results. It's pretty simple stuff in the end.
