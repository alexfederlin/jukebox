# Kid's Jukebox
Here you will find all resources I used to build my RFID jukebox project.
![Jukebox](https://lh3.googleusercontent.com/pv-Fiz7H5_kjdsXBR3EBHR22OiZAHizz9FE4_JCX-vNBZOEodPO9EkLWWmELTjNF7ljwb6dfjRhJmVQDA4LtR-4do3H9sG23VDzxw5u7QxAFE5a1CvwSMdHjk2XcNW-4wBEnOKUSLL8)

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

### Power
The power setup is not quite finished. The inital plan was to have a power button on the back which shuts down the raspi and powers off the amp with a short press. Powering on the raspi would have to be done by physically cutting the power.
I even have the script in the repo which would have to run on the raspi, watching for the button to be pushed. But, alas, I couldn't be bothered.
I still wired the amp to the relais (which is controlled by the Raspi), so in theory I could turn off the amp if no music is playing for a while...

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


