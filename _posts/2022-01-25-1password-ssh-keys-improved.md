---
title: 1Password and SSH Keys, Improved
excerpt: Releasing v1.0 of my key management suite, informed and improved by lessons learned from the original proof of concept.
---

Last time I [worked on a solution to my SSH key problem][previous post], I wrote scripts to store all my SSH keys in my 1Password vault and load those keys into my SSH agent whenever I need them. To recap, I wrote two scripts: `op-create-identity`, which generated a new keypair and wrote it to a 1Password vault item, and `op-add-identities`, which searched for identity items in your vault and added all their keys to the `ssh-agent` automatically. However, I've recently run into a problem with this approach: if you have too many keys in your agent, logging into a server will try all those keys sequentially until it finds the one for that particular server. I've recently needed to add additional keys for new hosts I need to remote into, which means I'm loading enough keys into my agent that some servers will start disconnecting me for too many login attempts before the correct key is checked.

To solve this problem, I needed to rework my utilities slightly. I needed to make sure each key was used only for its intended user and host, but I also wanted to avoid storing the keys on disk at any point (an advantage that attracted me to the `ssh-agent` approach in the first place). I knew that SSH config files could be used to set the keyfile used for authentication based on `Host` and `Match` directives, which seemed like a good place to start. However, `IdentityFile` directives can only be used to point at files, which means I also needed to use some sort of temporary in-memory filesystem to avoid persisting the keys across reboots.

## Changes and additions

I've taken the opportunity to rename the scripts to something more permanent and add a few features to them as well. The new `op-ssh-fetch` script replaces `op-add-identities`, and instead of pulling all keys and throwing them through `ssh-add`, it writes each key to a folder in `/dev/shm` (or `/tmp` if `/dev/shm` doesn't exist, though this can be customized). It then creates an SSH config file that points each host/user combination to the appropriate key, which I can include from my personal SSH config. Using `/dev/shm` means it can be guaranteed the keys will never be written to disk, though there is also a new `op-ssh-remove` script that can be used to nuke the storage folder manually.

```
$ tree /dev/shm/op-ssh-utils
/dev/shm/op-ssh-utils
├── keys
│   ├── 9n8gvb37hox9drhn8by742l98o
│   └── 9n8gvb37hox9drhn8by742l98o.pub
└── ssh_config

$ cat /dev/shm/op-ssh-utils/ssh_config
Match host 10.20.30.40 user erin
  IdentityFile /dev/shm/op-ssh-utils/keys/9n8gvb37hox9drhn8by742l98o

$ cat ~/.ssh/config
Include /dev/shm/op-ssh-utils/ssh_config
# ...
```

What's more, `op-ssh-fetch` accepts the `-n` option to do nothing if keys have already been pulled, which can be used in combination with a shell alias to ensure keys are pulled the first time you run `ssh` after logging in. For example, I use the following in my `.bashrc`/`.zshrc`:

```
export PATH="~/.1password-ssh-utils/bin:$PATH"
alias ssh="op-ssh-fetch -n && ssh"
```

I've also slightly redone the way keys are stored in 1Password, storing username and host in separate fields and creating fields with certain internal identifiers so the script still works if a user renames the fields for some reason. This required me to do some manual migration of my items from the first proof-of-concept version, but I think this time I've settled on a layout that's flexible enough to maintain going forward.

[![Screenshot of the 1Password web interface, displaying a vault item titled "10.20.30.40" and subtitled "erin." The entry has the following fields: host: 10.20.30.40; username: erin; password: concealed value; public key: the beginning of an RSA public key; private key: concealed value." ][screenshot]][screenshot]

The new `op-ssh-create` script replaces `op-create-identity`, and also adds some features like support for uploading an existing keypair rather than generating a new one, as well as making the `ssh-copy-id` and local registration steps optional in case you don't need to re-add an existing key to a host but still want to upload it to 1Password.

## Release and future plans

I'm still working on the quality of my bash code, and there are several other features I want to add to this suite before I'll be satisfied with it, but I'm pretty comfortable with the state of these tools and have made a 1.0 release for them [on Github][github]. If this sounds like something you'd be interested in using, please give it a try and let me know how it goes for you in [a new issue][new issue] or [on Twitter][twitter]! I'm always open to feedback and suggestions.

In the future, I hope to move away from the hardcoded output dir to support multiple users on a single system ([#5][issue 5]), and I also want to explore more portable options for storing files in memory ([#6][issue 6]). There are also improvements I want to make to how SSH items are picked up from the vault to make the experience a bit simpler and more predictable when editing an item from other 1Password clients ([#3][issue 3]). I'm excited to continue working on this project.

[github]: https://github.com/eritbh/1password-ssh-utils
[issue 3]: https://github.com/eritbh/1password-ssh-utils/issues/3
[issue 5]: https://github.com/eritbh/1password-ssh-utils/issues/5
[issue 6]: https://github.com/eritbh/1password-ssh-utils/issues/6
[new issue]: https://github.com/eritbh/1password-ssh-utils/issues/new
[previous post]: /2021/01/01/storing-ssh-keys-in-1password/
[screenshot]: https://i.eritbh.me/unnw47w5ZJB1e.png
[twitter]: https://twitter.com/eritbh/
