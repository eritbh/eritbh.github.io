---
title: Managing SSH Keys with 1Password
---
I have a problem: I can't maintain an OS instance for very long. On my laptop, I'll get frustrated with either macOS or Ubuntu and swap between the two a couple times a year, and on my Windows desktop, all my code projects are cloned to WSL, which I manage to corrupt surprisingly often. When I install a new OS, I often forget to take things like SSH keys with me, which means that I end up leaving password authentication enabled on all my servers to avoid locking myself out on the regular.

A couple days ago I decided I wanted to solve this problem. I've been a 1Password customer for a couple months now, and it's been an amazing experience using its integrations for filling passwords and 2-factor authentication tokens across my devices. What if I could just store my SSH keys in there too? Is there an integration for that? Well, not quite—but there *is* [a CLI][1password-cli].

Armed with the power of shell scripting, I set out to create an integration that would let me manage my SSH keys from the terminal. The idea is to create an SSH key pair for each server I need to connect to, and have the public and private keys stored only in 1Password. Then, I want these keys to be fetched automatically when I log into my computer and added to the SSH agent without the keys being stored on disk.

1Password's API seems to be mostly JSON-based, so this is all achievable with [a bit of `jq` witchcraft][tweet-jq-oneliner]. The final result is two scripts: `op-create-identity`, which creates key pairs, saves them to my vault, and adds them to servers, and `op-add-identities`, which pulls all key pairs from the vault and adds them to the SSH agent. I just dropped these scripts, along with the `op` binary, into `~/.local/bin` for easy access. You can check the code I came up with in [this Gist][script-gist].

To automatically fetch the keys when I log in, in Ubuntu desktop, I just created a new startup application that runs `gnome-terminal -e op-add-identities` when I log in. This approach isn't perfect, and won't work for me with my WSL install since there's no "Startup Applications" GUI, but it'll be good enough for now. In the future, I'll probably revise it to write a file once it's run once to prevent itself from running again until the next login. I'd probably do this by writing some conditional code into my shell profile and having the script cache the public keys to disk so it knows what's already been fetched, but I haven't worked out the details quite yet.

Hopefully this will be useful for anyone looking to set up something similar—I couldn't find many resources about this sort of thing when I was looking, just a couple old Reddit threads and 1Password forum posts that didn't seem to include any complete solutions. I'll update this post and the Gist above if I ever get around to making the improvements I mentioned.

[1password-cli]: https://support.1password.com/command-line-getting-started
[tweet-jq-oneliner]: https://twitter.com/eritbh/status/1344731396879822848?s=20
[script-gist]: https://gist.github.com/Geo1088/5db73c1ddf9c27c425e7f4bd1f054c1c
