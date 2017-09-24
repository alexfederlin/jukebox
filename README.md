# Kid's Jukebox
Here you will find all resources I used to build my RFID jukebox project.
![Jukebox](https://lh3.googleusercontent.com/pv-Fiz7H5_kjdsXBR3EBHR22OiZAHizz9FE4_JCX-vNBZOEodPO9EkLWWmELTjNF7ljwb6dfjRhJmVQDA4LtR-4do3H9sG23VDzxw5u7QxAFE5a1CvwSMdHjk2XcNW-4wBEnOKUSLL8)

(All pictures shown here are part of this [Google Photo Album](https://photos.app.goo.gl/Ljl14TL1XvXTWub62))

## TL;DR
It's a box which reads an RFID card, translates it into a folder on the Raspi's SD Card and instructing mpd to play it. You also have a display, buttons and a knob.

SW is written in bad node.js. If you just want to use it, all you need is to put the hardware together. There are Ansible playbooks which do all of the Raspi configuration and installation in the repo.
For building the hardware, there are complete instructions below and building plans in the repo. 

## Inspiration
The idea is not new. Instead of having CDs scratched in no time or paying ridiculous amounts of money for commercial RFID story players (has anyone ever bought a tonies? Really?), I decided to roll my own.

There are several good ideas for building RFID Jukeboxes out there:

They range from minimal viable products:
https://mwiedemeyer.de/blog/post/Raspberry-Pi-Jukebox-fur-Kinder

To quite sophisticated ones.
- http://www.forum-raspberrypi.de/Thread-projekt-jukebox4kids-jukebox-fuer-kinder
- http://www.forum-raspberrypi.de/Thread-projekt-rfid-media-player

## Parts
I decided the minimum for me would be the following in terms of hardware (all prices indicated are approximately what I paid in 2017, including shipping where applicable)
### Basics
- Box (Zeller-Holzkisten 30x20x15) - 6,50 EUR - hardware store
    - covers for the sides (I used metal mesh from a beat up IKEA waste paper basket)
    - front (7mm plywood from the hardware store) 
    - some more 1x2 cm wooden slats and some more plywood to mount the internal components
- Speakers, Amp (still had some small active speakers lying around)
- Raspi (still had a v1 lying around)
- Power supply (15W/5V MeanWell, RS-15-5) -  10 EUR - Amazon
- RFID reader (RDM630 UART 125KHz EM4100) - 8 EUR - Amazon
- another RFID reader for provisioning (SODIAL(R) USB RFID DeskTop ID Card Reader) - 5 EUR - Amazon
- 3 Arcade buttons (2 blue, 1 red) -  10 EUR - ebay
- 1 rotary encoder (KY-040 incl. nut) - 3 EUR incl shipping - ebay
- Ground loop insulator (AUKEY) - 10 EUR - Amazon https://www.amazon.de/gp/product/B01LX0H29W

### Small parts
- Ethernet connector (0.3m RJ45 Plug to Jack Panel Mount) - 4 EUR - ebay 
- USB cable (A to L shaped B connector) - 4 EUR - ebay
- ICE Socket C14 Inlet with switch and fuse - 4 EUR - ebay
- Some M3 screws and nuts - 9 EUR - ebay
- Resistors, capacitors - 2 EUR - ebay
- Jumper cable (some shorter, some up to 30 or 40 cm)
- heat shrinking tube

No arduino, no display.

However, what fun would it be without an Arduino?

So I scrapped that idea, or rather, I extended it.

### Extension
- Arduino Uno (used to control RFID reader, Buttons, Rotary dial, eventually an LCD) 23 EUR - Amazon
- Proto Shield V5 Prototyping Board für Arduino Uno - 6 EUR - ebay
- Display (16x2 Zeichen + I2c Modul) - 7 EUR - ebay
- Relais 2-Channel 5V Relais with Optokoppler - 5 EUR - ebay
- Wifi Stick (Edimax EW-7811Un) - 7 EUR Amazon

### Price
So, if you tally this up, not exactly cheap. 
Bare bones 75 EUR
Extensions 48 EUR
Total: 123 EUR

And this is without the Raspi, speakers and amp, since I had all of this still lying around...

Add to that maybe 100 hours of research, design, building, programming... But the learning experience was priceless :-)

## Hardware
Putting together the hardware components was a combination of woodwor and electronics. With this you have to choose the order of what you're doing wisely. Else you end up with a lot of wood shavings on your electronics parts...
### Box
A basic wooden box from the hardware store (Bauhaus).  In each corner I glued some 1x2cm wooden slates. These were cut to length so that the 7mm plywood front ended up flush with the rim of the box. 
On the sides of the box are holes, so you can carry it (if you use it as an actual storage box. They're handy for ventilation, but you'll want to cover them to keep out sticky things and pokey fingers. I cut up a beat up steel mesh waste paper basket from Ikea and upcycled the mesh for this purpose. I used a staple gun to fix it to the inside of the box.

#### Front Panel
I had the plywood for the front cut to size in the hardware store. If you have a buzz saw, you can probably do it yourself, but with a jigsaw - forget it. The front I set into the box and is screwed into the slats in the corners.
Before you do that, all the components have to be fixed to it of course. The layout of the front panel you can find as a draw.io sketch in the Documentation folder of this repo.



![Front panel in intermediate stage](https://lh3.googleusercontent.com/KnXsJln1Bquqtn5p8mh-4QFw91fhGseS-2i6s9ZYvtAo9sQVTgemcS-LPBM7Wk3klUYn0pOHfd4q0L_zFknLclYxM_mvy0OzIASM_FacSYd0XWuJVIPOZ-b21lAaf7sdmohfKLaudNY)

The front panel holds 
- the speakers
- amp
- display
- 3 arcade buttons (forward, back, play/pause)
- a rotary encoder (volume)
- the RFID reader along with its Antenna 
- Arduino.

Having all these components together on the front panel has the advantage that there are only 4 cables connecting the front panel and the back plane: 
- USB cable (Arduino - Raspi)
- Audio cable (Amp - Raspi)
- Power for the Amp (throught the Relais)

##### Tools and manufacturing
![Front panel](https://lh3.googleusercontent.com/ICs7BttuntgUGOqpm5ZJE6vntgah_R_bq6Wdfw8MIzl7-MiIOEBZ8M3p1Dhs1vWdPFCP_lArL4-pBr_GL3evcE0QFpWZRjURkGzgFbCpc6Vbd_jJyghNVaaNc-jNZU0l4YHQbK2RXGk)

The front panel requires a number of holes to be drilled and cut out. Tools used were
- drill 3.5 mm
- sink bit 3mm to get the screws flush with the wood
- Forstner drill 30 mm for Arcade buttons
- Holesaw 45mm for speakers
- large drill and jigsaw for the display cutout
- industrial rotary tool (Proxxon IBS) for removing some material on the back side to fit the display

![shaving on the back](https://lh3.googleusercontent.com/sm8uvPnlQxJuIS9blaYCCekb4u3A3xpcemDQsq1SRiyrkjAunXCSQnofNtau-Sik6sESNWvMXzMVtEgrCRduQNQlQXTalAmE-TzPBqvdFAB6hlb6iZCyx6obknlxpI0CEYRL9-uFbKs)

When cutting out the holes for the speakers - cut the big holes first, before you drill the screw holes. Once you have the big holes in place, put the speakers on there and mark where the screw holes need to go. I did it all at once just with measurements and of course my speakers now sit off-center on the holes...

#### Back plane
As back plane I used another piece of plywood. This one I cut myself, because you can't see it anyway, so it's ok if the edges are a bit squiggly. I glued some scrap pieces of plywood to the bottom of the box so it's raised up a bit. I put in some screws at an angle that go into the corner slats to hold it in place.

The picture below was taken when I tried to figure out what goes where on the backplane. Nevermind the funny cutout in the upper part. I was practicing for the display cutout on the front...
![Backplane intermediate](https://lh3.googleusercontent.com/HYZRa7jl0EmlxhneIKTELqHd_iMV9qOtNZCo-W0w6oK2wljI6KB8HYewQrOslvmv-UHOn5q2DkL2MiKuu5QUrLFFTVN-esSuDVbFTCRbSzZQ2eYnbDCnmPXUIOSu6kCEvSykt8D66rg)

The backplane only holds
- the Raspberry
- power supply
- power relais

I used the lower snap-in half of a Raspi case to hold the Rasperry. This is quite nice because only the case is screwed to the back plane and the Raspi itself is easily removed. That makes e.g. changing the SD card much easier.
The other components are just strapped to the plywood using cable ties threaded through holes I drilled into the plywood.

There is also a cut out for the only components that are actually attached to the box itself:
- the C14 power inlet
- the RJ45 panel mount
- the power button i didn't get around to installing

![Back](https://lh3.googleusercontent.com/X5npm117mHoMTw28rSq9oKQqzP-JSwatnUfUdwawmgIpjmYLjMSfgGo1GOsHT9O4Z7YbLp2C1VEypHq8CELOCQyqvA9RCxNeEMLUmUcPg9Q7ZtgPie-SJl9oi3KQFNcHorJeXODr7bY)

### Power
The power setup is not quite finished. The inital plan was to have a power button on the back which shuts down the raspi and powers off the amp with a short press. Powering on the raspi would have to be done by physically cutting the power.
I even have the script in the repo which would have to run on the raspi, watching for the button to be pushed. But, alas, I couldn't be bothered.
I still wired the amp to the relais (which is controlled by the Raspi), so in theory I could turn off the amp if no music is playing for a while...

### Electronics

Now that we got all of that boring woodwork out of the way, now for the fun part...
![Full](https://lh3.googleusercontent.com/nlyr2uLGEFCEavF0wD4c7s7EIrI-ZpbU7ybi2r2uZ68XDOGzAylaUaS8_jRFzidz0GKXOWT7dI9ZYtOeP7kX_L5J2CsIjEZIfIcffQ73ek_WuajmsANeBRSzVNUAIGpjfq2VSORZiT8)

#### Arduino

There is a Fritzing sketch in the Documentation folder of this project...

![Fritzing](https://github.com/alexfederlin/jukebox/raw/master/Documentation/Arduino_prototype_board_fritzing_Steckplatine.jpg)

There are a couple of things to connect to the Arduino:
- 3 Buttons
- a KY40 Rotary Encoder
- a display
- and of course the RFID reader

I use the prototyping board that you can plug on top of the Arduino to solder all my circuitry. It's all a bit small and it's not pretty, but it is absolutely doable (I'm not really a wizard with the soldering iron).And it's probably less prone to cables coming loose than breadbords - which you also would have to glue to the front panel somehow...

![Arduino](https://lh3.googleusercontent.com/BZ3ndRm3Ud84WDgVp0vnmiLSXXV-fyj5NB5dJFsO7I66qA1438y6bSPvf6Nuu5o7kDE5jOhMNqn1dU5-5STs3HTOYCx_q7q0u6wV7F6fxrKEU8F3op15dqGql2z3z5UgXcvd4JIu-pc)

##### Buttons
I decided to go with a hardware debounce for the buttons. For this I used a 1uF capacitor and a 10kOhm resistor. Why do it in hardware? Because I can. In retrospect, it probably would have been easier to do it with less hardware elements for space reasons, but hey, it works.

##### Rotary Encoder
I had a bit of a hard time with the rotary encoder for adjusting the volume. I found out that there are different hardware versions available. Some have a thread and a nut with which you can fix them to a panel. Some don't...
I also tried HW debouncing, but that didn't work. I tried a gazillion libraries that all claim to do SW debouncing for rotary encoders... luckily I found one that worked. More on that in the SW section.

##### Display
The display is a fun thing to play with. In the final product it's of less use than I thought. I tried scrolling text, but it looks horrible. So you're really confined to 2x16 characters. And putting some sensible stuff on there is more effort than I was prepared to spend to this point.
All the pins needed to drive the display are connected to the Arduino using long jumper wires. I soldered a pin strip to the display board to be able to just plug them on.

##### RFID reader
The RFID reader comes with a small board of its own which you need to connect. Since I was too lazy to figure out a way to secure it to the front panel, I simply soldered it onto the prototyping board and connected it up that way (the upside down board one the left on the picture above).
I used hot glue to stick the RFID antenna to the front panel and to stabilize the connection between the actual antenna and the cable leading to the reader board. These braids are so fine I was worried they'll break before I can fix them.




## Software
The whole thing is based on the Music Player Daemon mpd. In theory you scrap the whole interface on the box and just control the whole thing with [M.A.L.P.](https://play.google.com/store/apps/details?id=org.gateshipone.malp) or some other mpd remote control app. 
But of course that wouldn't be as much fun. So we have to roll our own for hooking up all that interface stuff.

### General Architecture
So in general, there are 4 components that interact somehow:
- The Arduino - handling the front end user interface and presentation layer (aka Display)
- The Arduinogateway - the code translating user input from the Arduino to commands to the mpd (and info back to the display)
- The Playlist Mapper - handling the database to translate an RFID tag to a path which the mpd can play
- The mpd - playing the actual music

### Arduino Sketch
The Arduino folder is actually a complete [platform.io](http://platformio.org/) project. It enables you to write your changed Arduino sketch stright to the Arduino from the Raspberry. No more clunky Arduino IDE. It will even download and install all the necessary libraries automatically. I love it.

Anyway, there's quite a bit going on in the sketch, so let's check it out component by component
#### Display
I use the [LiquidCrystal](https://www.arduino.cc/en/Tutorial/LiquidCrystalDisplay) [Library](https://www.arduino.cc/en/Reference/LiquidCrystal), which is easy enough to use. As I mentioned, scrolling looks horrible because the display is so slow to switch on and off. Pixels which are used from one step to the next remain really bright, while the others are pretty dim. The result is pretty much garbled. Anyway, if you want to try it, [this sketch proposed by Goet](https://forum.arduino.cc/index.php?topic=216486.msg3338710#msg3338710) seems to work pretty well...

One thing that I think is pretty neat is the automatic backlight dimming I implemented using the PWM pin on the Arduino. By hooking up the backlight pin of the displa to one of the "analog" pins of the Arduino, I'm able to dim the backlight in the code. It goes bright at any input, and dims after there hasn't been any input for 10 seconds.

#### Serial Connection
Using SoftwareSerial for the serial connection to the Raspi through the USB cable. The Arduino is also powered through the USB cable.
The protocol between the Arduino and the Raspi (Arduinogateway process) is extremely simple. There are 5 commands which the Arduino can send to the Raspi:

- CMD: setvol xx
- CMD: previous
- CMD: next
- playpause
- RFID: xxxx

The ones prefixed by CMD: are piped verbatim to the mpd by the Arduinogw. The others need to be handled separately.

Everything else that is sent will just be logged by Arduinogw. Everything the Arduino receives on the serial connection is printed on the display.

#### Rotary Encoder
Oh boy, I tried many libraries for rotary encoders. None really worked. Then I found the [stuff the boolrules posted](https://forum.arduino.cc/index.php?topic=242356.msg2308019#msg2308019). I have no idea what it does, but I was able to integrate it and it works like a treat. It has two modes (interrupt and polling), I use it in polling mode and have thrown away the unused interrupt code.

#### Buttons
#### RFID reader
0007616525

0011 0000 
0011 0000 
0011 0000 
0011 0111 
0011 0110 
0011 0001 
0011 0110 
0011 0101 
0011 0010 
0011 0101

remove the leading 0011s

0000 
0000 
0000 
0111 
0110 
0001 
0110 
0101 
0010 
0101

and put them together to new bytes

0000 0000  0x0
0000 0111  0x7
0110 0001  0x61
0110 0101  0x65
0010 0101  0x25


now the number (7 mio 616 thousend 525) is converted to bin
0111 0100  0x74
0011 1000  0x38
0000 1101  0x0D






### Raspberry
#### Arduino Gateway
#### Playlist mapper



## Deployment
If you have a Linux or Mac system, you can just follow the instructions below. If you're on Windows, you'll have to make Ansible run as Control node [somewhere somehow](http://www.tomsitpro.com/articles/how-to-use-ansible-on-windows,1-3479.html). 

1. On your main PC: install Ansible
2. PC: clone this git repo
3. Raspi: install latest Raspian light
3. Raspi: [enable ssh access](https://www.raspberrypi.org/documentation/remote-access/ssh/) and make sure you can login to the Raspi from your main PC
4. PC: make sure you have an ssh key and install it on the Raspi: `cat ~/.ssh/id_rsa.pub | ssh pi@raspberry 'mkdir .ssh && cat >> .ssh/authorized_keys'`
5. PC: enter the IP of your raspi in the ansibles inventory
6. PC: start the playbooks in order 1-3. 

### Ansible Playbooks
- 01:
  - set password of user pi to: jukebox
  - force apt to use IP4 (else apt installation does not work for me)
  - force audio through 3,5mm jack
  - do apt update / upgrade and install several packages
  - download and install node.js 7.9.0
  - instructs mpd to update its database
- 01a: You can skip 01a if you do not have an extra partition for your music (see multi-partition setup below).
- 02: clone this git repo and install the necessary nodejs modules
- 03: Sets up the necessry services to be started at boot and starts them
- 04: is only needed if you want to use rsync to sync a music folder on your main (or other) PC to the jukebox.

If all the playbooks went through without error, everything should be installed and configured and all services should be up and running on the raspberry.
There are a couple of optional playbooks which 
- opt01/a: allow you to switch back and forth between a USB sound card and the built-in 3.5 jack audio output
- opt02: Installs [platformio](http://platformio.net) on the raspi (for flashing your Arduino straight from the Raspi)

## Operations

## Provisioning


# Special cases
## Multi-Partition setup.
I like to have my music on another partition than the root system. In case I need to reinstall the system, I don't have to re-upload all of the music. Having multiple partitions on a raspi system is not quite as straightforward as I'd hoped. 
In general Raspbian resizes the root partition to fill the whole medium at the first boot. It does not do this, if another partition is already present on the device. In that case, the root partition of the raspi is too small to install anything extra. So you have to enlarge it manually. After doing that, the PARTUID has changed, so you need to update the /boot/cmdline.txt and /etc/fstab on your raspi system...

### WARNING - HERE BE DRAGONS
In the following I'll describe how I set it up. You'll have to think for yourself what you are doing! I take no responsibility for any wiped harddrives...

1. Download latest raspbian (
2. check if download is correct `sha256sum 2017-08-16-raspbian-stretch-lite.zip`
3. unzip raspbian image `unzip 2017-08-16-raspbian-stretch-lite.zip`
4. put on SD Card - MAKE SURE YOU SPECIFY THE CORRECT DEVICE AS of=/dev/sxx `sudo dd if=2017-08-16-raspbian-stretch-lite.img of=/dev/sxx bs=1M`
5. create additional partition on sdcard for music `fdisk /dev/sxx`
    If you start fdisk and [p]rint all partitions, you will find something like this:
```
Medium /dev/sdd: 59,5 GiB, 63864569856 Bytes, 124735488 Sektoren
Einheiten: sectors von 1 * 512 = 512 Bytes
Sektorengröße (logisch/physisch): 512 Bytes / 512 Bytes
I/O Größe (minimal/optimal): 512 Bytes / 512 Bytes
Typ der Medienbezeichnung: dos
Medienkennung: 0xee397c53

Gerät      Boot Start    Ende Sektoren Größe Id Typ
/dev/sdd1        8192   93813    85622 41,8M  c W95 FAT32 (LBA)
/dev/sdd2       94208 3621911  3527704  1,7G 83 Linux
```
or, if you want to use parted
```
$ sudo parted /dev/sdd
GNU Parted 3.2
/dev/sdd wird verwendet
Willkommen zu GNU Parted! Rufen Sie »help« auf, um eine Liste der verfügbaren Befehle zu erhalten.
(parted) p                                                                
Modell: Generic STORAGE DEVICE (scsi)
Festplatte  /dev/sdd:  63,9GB
Sektorgröße (logisch/physisch): 512B/512B
Partitionstabelle: msdos
Disk-Flags: 

Nummer  Anfang  Ende    Größe   Typ      Dateisystem  Flags
 1      4194kB  48,0MB  43,8MB  primary  fat32        LBA
 2      48,2MB  1854MB  1806MB  primary  ext4
```

As you can see, the raspi partition is only 1,7 Gb. There will most likely a lot of empty space on your device left. If you boot this now, raspian will automatically resize the root partition to take up the whole device. 

What you actually want is a root partition which is 5-6GB and another partition which takes up the remaining space on the device for your data. 

So you need to delete the root partition, recreate it with the same start boundary, but a bit larger, and then create another partition for your data taking up the rest of the space (or however much you like)

