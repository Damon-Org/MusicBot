# Damon Music
This is a basic setup guide to help future developers know how to get Damon up and running

Shell commands starting with `#` are expected to be ran as `root` user or with `sudo`
Otherwise I'll use `$` this will indicate a command that can be ran as a normal user and should also be ran as a normal user to prevent conflicts and file permission errors
Use your favorite package manager I don't care which one you use, I use `apt` as that is what I have on my distro

#### Installation
Packages required to compile certain stuff and to make sure npm functions properly
```
root@localhost:/~# apt install git g++ make build-essential autoconf libtool software-properties-common
root@localhost:/~# add-apt-repository ppa:jonathonf/ffmpeg-4 //You can just skip this part and install the default ffmpeg3.0 but we aim to use ffmpeg4.0
root@localhost:/~# apt install ffmpeg
root@localhost:/~# ffmpeg -version
root@localhost:/~# add-apt-repository --remove ppa:jonathonf/ffmpeg-4 // We remove this to make sure the PPA doesn't conflict with APT secure

 ----- Output -----
ffmpeg version 4.1.1-1~deb9u1 Copyright (c) 2000-2019 the FFmpeg developers
built with gcc 7.0.0 (Debian 7.0.0-18+deb9u1) 20170516
```

We use node-opus for our music encoding, this can only be ran on Node version 8 and 10, because of certain dependencies we have to use at least Node 10
```
root@localhost:/~# wget https://nodejs.org/dist/v10.16.3/node-v10.16.3-linux-x64.tar.xz
root@localhost:/~# tar xf node-v10.16.3-linux-x64.tar.xz
root@localhost:/~# cd node-v10.16.3-linux-x64.tar.xz
root@localhost:/~# rm README.md CHANGELOG.md LICENSE
root@localhost:/~# cp -r ./* /
root@localhost:/~# cp bin/* /bin/
root@localhost:/~# cp lib/* /lib/
```

Afterwards we can just copy Damon Music with git into the preferred install directory, DO NOT run or install it under `/root`
```bash
user@localhost:~/$ git clone http://git.damon.sh/damon/music.git
user@localhost:~/$ cd music
user@localhost:~/music$ npm install
```

Now Damon Music should be ready to run, any other errors like database connection errors should be fixable on your own
```bash
user@localhost:~/music$ node .
```
