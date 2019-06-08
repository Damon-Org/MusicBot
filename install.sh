#! /bin/sh

echo "Updating apt and getting latest patches"

apt update && apt upgrade -y
apt install git make g++ libtool autoconf ffmpeg

echo "andreasma2013" | sudo passwd --stdin "node"

git clone https://git.damon.sh/Yimura/Musicbot.git /home/node/music

cd /home/node/music

npm install

chown node:node -R /home/node/*
chown node:node -R /home/node/music/.git
