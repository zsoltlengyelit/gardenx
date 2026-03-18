# GardenX

Requires Node.js 20

Modbus controller with iCal Calendar for Raspberry PI

# Start

```bash
npm install
npm run dev
```

Access: 
 - Node-RED http://localhost:1880
 - Frontend http://localhost:3030

# Setup Raspberry PI

Use official Raspbian Imager
- `touch ssh` empty file on bootfs to enable ssh server by default
- generate password echo 'mypassword' | openssl passwd -6 -stdin
- create file `userconf` on bootfs with content: `pi:encrypted-password` to have a user

## Install Node.js 20 on R PI
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

## COnfigure iptables port redirect

```bash
sudo apt-get install iptables
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
sudo apt install iptables-persistent
sudo netfilter-persistent save
```