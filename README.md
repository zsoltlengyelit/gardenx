# GardenX

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
