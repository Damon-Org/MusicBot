#! /bin/sh

echo "Updating apt and getting latest patches"

apt update && apt upgrade -y
apt install -y git make g++ libtool autoconf ffmpeg curl

echo andreasma2013 | sudo passwd --stdin node

git clone https://git.damon.sh/Yimura/Musicbot.git /home/node/music

curl -sL deb.nodesource.com/setup_8.x | bash -
apt install -y nodejs

cd /home/node/music

npm install

chown node:node -R /home/node/*
chown node:node -R /home/node/music/.git
