# Kid's Jukebox
Here you will find all resources I used to build my RFID jukebox project.

## TL;DR
It's a box which reads an RFID card, translates it into a folder on the Raspi's SD Card and instructing mpd to play it. You also have buttons and a knob.

## Inspiration
The idea is not new. Instead of having CDs scratched in no time or paying ridiculous amounts of money for commercial RFID story players (has anyone ever bought a tonies? Really?), I decided to roll my own.

There are several good ideas for building RFID Jukeboxes out there:

They range from minimal viable products:
https://mwiedemeyer.de/blog/post/Raspberry-Pi-Jukebox-fur-Kinder

To quite sophisticated ones.
- http://www.forum-raspberrypi.de/Thread-projekt-jukebox4kids-jukebox-fuer-kinder
- http://www.forum-raspberrypi.de/Thread-projekt-jukebox4kids-jukebox-fuer-kinder?pid=191055#pid191055
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
I had the plywood for the front cut to size in the hardware store. If you have a circular saw, you can probably do it yourself, but with a jigsaw - forget it. The front I set into the box and is screwed into the slats in the corners.
Before you do that, all the components have to be fixed to it of course. The layout of the front panel you can find as a draw.io sketch in the Documentation folder of this repo.
The front panel holds the speakers, amp, display, 3 arcade buttons (forward, back, play/pause), a rotary encoder (volume), the RFID reader along with its Antenna and of course the Arduino.
Having all these components together on the front panel has the advantage that there are only 4 cables connecting the front panel and the back plane: 
- USB cable (Arduino - Raspi)
- Audio cable (Amp - Raspi)
- Power for the Amp (throught the Relais)

### Power
### Arduino

## Software
### Overview
#### General Architecture
#### Arduino Sketch
#### Arduino Gateway
#### Playlist mapper
### Arduino specifics

## Deployment
### Ansible Playbooks

## Operations

## Provisioning


