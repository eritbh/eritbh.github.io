---
title: Self-Hosting a Minecraft Server
---
A couple months ago, a friend of mine decided that we should play some modded Minecraft together. This meant we needed a private server to play on, and neither of us really felt like paying for one, so I launched into a quest for the perfect self-hosted Minecraft server solution without knowing anything about how this is actually meant to be handled.

## PC hosting

We decided to play with the MC Eternal Lite modpack, which you can find [on CurseForge][mce lite], and the page offers a download for a server pack, which basically has a prebuilt server directory there for you, complete with a handy-dandy `.bat` file for starting it up. I already kept my PC on all the time anyway, so setup should be simple - just put the server pack somewhere on my desktop, start it up, and leave it running. Forward 25565 on my PC to the internet, make sure friend can connect, and we're off.

This setup was fine for a few days, but eventually I needed to reboot my PC for something, and I forgot to restart the server when I was done. I can't be trusted to remember that sort of thing, so I set out looking for a way to start it up immediately on startup. Knowing that systemd services accomplish something similar on Linux, I figured running the server as a service under Windows would probably work similarly. I found a tool called [NSSM, the Non-Sucking Service Manager][nssm], which let me easily create a startup task for running the server's start.bat, and that was that. Problem solved.

## Using a Linux server

Then came the issue of moving. I recently moved out of my parents' house and into an apartment, and while living alone has brought me many benefits, it does have the drawback of not having a network I can tinker with and port forward on. So hosting the server on my PC was no longer an option. Given this happened right around Black Friday, and I had half a computer laying around, I decided I'd just get a deal on a cheap CPU and RAM and throw together a PC I could leave with my dad and use as a server. So now I've got myself a server. Drop a fresh Ubuntu install on it, set up SSH, rsync the server files from my PC, now I've got myself a Minecraft server. Throw together a systemd service definition for it, now I've got an auto-starting Minecraft server.

Then I got greedy. I thought to myself, "This modpack sure takes a long time to load. It'd be nice if I didn't have to load all the mods and join the server just to use console commands. But since I'm running the server as a service, I can't talk to the console. Can I fix that?"

It turns out, yes, you can! There's no good way to just attach to the stdin of a service, but you *can* bind the stdin to something else in the service definition. If we make "something" a named pipe, then we can write commands into the pipe whenever we want, and the server will run them just like we're typing into its console. So I set about doing something like that.

After some effort I found [this excellent blog post about the problem I was facing][console bound services the right way], which describes a solution to this problem: By introducing a `socket` unit, you can automatically create a named pipe that binds to the standard input of your `service` unit. The configuration I've come up with looks a little something like this:

```ini
# minecraft-server.service
[Unit]
Description=Minecraft server
After=network.target

[Service]
User=minecraft
Group=minecraft
Sockets=minecraft-server.socket
StandardInput=socket
StandardOutput=journal
StandardError=journal
WorkingDirectory=/home/minecraft/servers/mc-eternal-1-12-2
ExecStart=/home/minecraft/servers/mc-eternal-1-12-2/start.sh
ExecStop=/home/minecraft/servers/mc-eternal-1-12-2/stop.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

```ini
# minecraft-server.socket
[Unit]
Description=Command FIFO for Minecraft server MCEternal 1.12.2
PartOf=minecraft.mc-eternal-1-12-2.service

[Socket]
ListenFIFO=/home/minecraft/minecraft-server/run/stdin
DirectoryMode=0700
SocketMode=0600
SocketUser=minecraft
SocketGroup=minecraft
RemoveOnStop=true
```

There's a couple things to note about this setup.

- I run stuff on my boxes under dedicated users whenever possible, so `minecraft` is a user (and group) I'm running the server as.

- The socket unit creates the named pipe in the server folder, in a subdirectory I called `run`. This seemed to make the most sense for me, but it might be more appropriate to put it somewhere else.

- The socket unit has `RemoveOnStop=true`, which prevents the named pipe from hanging around between restarts or anything weird like that.

So now, if I want to run a server command while the server's running, I can just log in as `minecraft` and echo to the pipe. And I can view the server's output through `journalctl`, with some rough formatting with `cut`:

```
erin@homebox $ sudo su - minecraft
minecraft@homebox $ echo "say hello" >> minecraft-server/run/stdin
journalctl -u minecraft.mc-eternal-1-12-2.service -f -n 10 | cut -d: -f7
 [Server] hello
```

You may have also noticed that I specified `ExecStop=stop.sh` in the service definition. Now that we know we can write server commands somewhere, we can set up `systemctl stop minecraft-server` to perform a graceful shutdown of the server by sending the `stop` command and waiting until the process dies on its own:

```sh
# stop.sh
#!/bin/bash
echo "stop" >> run/stdin-fifo
while kill -0 “${MAINPID}” 2> /dev/null; do
    sleep 1s
done
```

## Shenanigans

I've accomplished everything I wanted, and now I'm getting cocky and want more. The server is a bit buggy and needs to be restarted every once in a while for certain things to work. I don't play as frequently as my roommate, so having to field requests to restart the server is a bit annoying, but I don't trust them not to cheat if I gave them op.

As it turns out, there are few tools more useful than a Wifi-enabled Raspberry Pi with a big red button on it. With SSH access to the server, it can just restart the server any time the button is pushed. I threw it all in the [first project case I could find][cereal box project case] and mounted it outside my roommate's door, so they've always got easy access to it.

There's still a lot I could improve about this setup. It'd be neat to make a web panel that can show me logs and run console commands without me having to SSH into anything; I'm sure there's other software out there that can do stuff like this, but I haven't shopped around much. In any case, this experience has been an entertaining way to learn a bit more about managing services on Linux servers.

[mce lite]: https://www.curseforge.com/minecraft/modpacks/mc-eternal-lite
[nssm]: http://nssm.cc/
[console bound services the right way]: https://blogs.gentoo.org/marecki/2020/09/16/console-bound-systemd-services-the-right-way/
[cereal box project case]: https://twitter.com/eritbh/status/1339209799062446081
