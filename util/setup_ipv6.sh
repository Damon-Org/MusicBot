ndppd_config="/etc/ndppd.conf"
if test -f "$ndppd_config"; then
    echo "ndppd has already been setup before, stopping setup..."
    exit 2
fi

apt update && apt upgrade -y
apt install -y make g++ curl

wget https://github.com/DanielAdolfsson/ndppd/archive/0.2.5.tar.gz -O - | tar xz
cd ndppd-0.2.5
make
make install

ipv6=$(curl -6 http://icanhazip.com/)

if [[ $ipv6 == *"curl:"* ]]; then
    echo "Failed public IPv6 lookup"
    exit 2
fi

cd

echo "route-ttl 30000\r\n
proxy ens3 {
    router yes
    timeout 500
    ttl 30000
    rule $ipv6/64 {
        static
    }
}" > $ndppd_config

echo 1 > /proc/sys/net/ipv6/ip_nonlocal_bind
ip -6 route add local "$ipv6/64" dev lo

ndppd -d

echo "Installing cronjob for ndppd..."

crontab -l > mycron
echo "@reboot ndppd -d" >> mycron
crontab mycron
rm mycron
