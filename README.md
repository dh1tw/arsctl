# ARSCTL - a flexible web interface for your antenna rotators


Arsctl is a server side application which makes all your antenna rotators available on a network. Arsctl allows you to conveniently control your rotators from any computer / tablet or smartphone through a slick web interface. Arsctl can also hook transparently into a [Win-Test](http://www.win-test.com) network and provide the rotators directly to the Win-Test application. Arsctl is based on [NodeJs](https://nodejs.org/) and written entirely in Javascript.

![Screenshot of arsctl in action](http://www.dh1tw.de/wp-content/uploads/2015/01/Screen-Shot-2014-11-13-at-02.06.42.png)

The library has been used in several major contests at [ED1R](http://www.ed1r.com) and has proven to be stable.

## Documentation
You can find a detailed description of arsctl on [DH1TW's blog](http://www.dh1tw.de/network-accessible-rotators). The source code is also well documented.

## Supported Rotators
Arsctl supports [EA4TX' fabulous Antenna Rotator System (ARS)](http://www.ea4tx.com) and Yaesu rotators with a USB / serial interface.


## License
Arsctl is published under the [GPL open source license](https://github.com/dh1tw/arsctl/blob/master/gpl.md). Feel free to fork and collaborate!

## Supported OS
Arsctl has been developed and tested under OSX and Linux (Ubuntu). However it should also work with some minor tweaks on other Linux distributions and Windows. It works very well on small ARM devices, like the Raspberry Pi & Banana Pi.

## Installation (quick)

1. Install a copy of the latest NodeJs version on your system. Note that the version in the Ubuntu repository is quite old. Better install it from the the [Nodejs PPA](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager).

2. Clone the arsctl repository with git on your local machine 
    `git clone https://github.com/dh1tw/arsctl.git`

3. Browse into arsctl's directory and install all the needed dependencies with Node's package manager (NPM). All dependencies are registered in package.json
    `npm install`

4. Configure your rotator and webserver setup (config.js).

5. Run arsctl of the source code directory with 
    `node ./bin/www`
    
6. Open your browser and navigate to url put in the config file. For example
    http://localhost:4000

## Installation (optional steps)

1. It is recommended to separate the config file from the source code (e.g. /etc/arsctl/myConfig.js) so that the config file doesn't get overwritten on the next software update. Some configuration file examples are included in the `/examples/arsctl_config_files` folder.

2. Point to the location where your config file is located (in app.js).

3. It is recommended to daemonize arsctl and run arsctl as a service. For Ubuntu's Upstart a example file has been included in the `/examples/upstart_service` directory. This file should be copied to `/etc/init/arsctl.conf`.

4. If you want to use the standard HTTP port (or any other port below 1024) make sure that you execute arsctl under root priviliges.

5. For logging you might create and direct the application output to you a file, e.g. (`/var/log/arsctl.log`)

6. If you have more than one rotator connected through USB, Linux might assign them to different port names everytime you plug them in. In order to map a USB device to a specific port (e.g. `/dev/Rotator1`) you have to create a custom udev rule with the Rotator's DeviceId, ProductId and SerialNr. The file with the custom rule has to be placed under Ubuntu in `/etc/udev/rules.d/`. An example for a custom udev rules file is located in `/examples/udev_rules`.

## Known bugs

Due to some bugs in the [SerialPort](https://github.com/voodootikigod/node-serialport) Library, serial devices can't be  properly removed. Therefor the application terminates when a Rotator gets disconnected. If you daemonize arsctl, it will automatically restart.
