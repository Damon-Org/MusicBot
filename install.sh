apt update && apt upgrade -y
apt install -y git make g++

echo "Installing node"

wget https://nodejs.org/dist/v12.16.2/node-v12.16.2-linux-x64.tar.xz
tar xf node-v12.16.2-linux-x64.tar.xz
cd node-v12.16.2-linux-x64
rm CHANGELOG.md LICENSE README.md
cp -r ./* /
cp -r bin/* /bin/
cp -r lib/* /lib/

adduser --quiet --disabled-password --shell /bin/bash --home /home/node --gecos "Node Service" node
# echo "node:theNewPasswordForThisUser" | passwd

# su - node
cd /home/node/

git clone https://github.com/GeopJr/Soft-Wet -b soft_wet_remake ./soft_wet
cd soft_wet
npm install

chown -R node:node ./soft_wet

echo "Setup Soft and Wet in home directory /home/node, the user doesn't have a password by default."
