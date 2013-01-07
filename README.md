# pupil

A monitoring tool which gives you realtime statistics with low latency, at a low price.

## How to set up

You need nodejs installed.

On Ubuntu precise and newer, this should do the trick;

```bash
apt-get install nodejs npm
cd /opt
git clone https://github.com/pupil-monitoring/pupil.git
cd pupil
sudo npm install node-gyp -g
npm install
cp etc/pupil-upstart.conf /etc/init/pupil.conf
start pupil
```


