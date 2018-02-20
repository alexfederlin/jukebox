# shutdown script for Raspberry Pi
# watch LOW level on pin 5 to enter sleep mode
# status led on pin 7: ON = ready, BLINK = confirm button

import RPi.GPIO as GPIO
import os
import time

# use the pin number as on the raspi board

GPIO.setmode(GPIO.BOARD)

# set pin 7 as output and HIGH, pin 5 is input

GPIO.setup(37, GPIO.OUT)
GPIO.output(37, True)
GPIO.setup(40, GPIO.IN,pull_up_down=GPIO.PUD_UP)

# start the loop for every .5 seconds, waiting for LOW on pin 5
# then 2 short flashes with led to confirm and shutdown to sleep mode

while True:
        if not (GPIO.input(40)):
                GPIO.output(37, False)
                time.sleep(.1)
                GPIO.output(37, True)
                time.sleep(.1)
                GPIO.output(37, False)
                time.sleep(.1)
                GPIO.output(37, True)
                os.system("sudo shutdown -h now")
        time.sleep(.5)
