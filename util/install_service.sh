test=$(systemctl status music)
if [[ $test != "Unit music.service could not be found." ]]; then
    echo "Music service already is installed or a service with the same name already exists..."
    exit 2
fi

cp ./music.service /etc/systemd/system/music.service

systemctl enable music
#systemctl start music
