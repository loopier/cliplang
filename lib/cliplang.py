# Send commands to Clip server
#
# Call this script with just one argument: a single string of all the
# commands you want to send, separated my line breaks '\n'
# For example, if you call it like this:
#
#   python clip.py 'new exampleclip\ncolor exampleclip 1 0.5 0'
#
# it will create a new clip using the default resource and will color it orange

from pythonosc import udp_client
import logging
import sys

# -- uncomment next line if you prefer debug log-level
# logging.basicConfig(format='%(levelname)s:%(funcName)s: %(message)s\n', level=logging.DEBUG)
logging.basicConfig(format='%(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


# converts non-string values to int or float
def convertType(value):
    try:
        return int(value)
    except ValueError:
        try:
            return float(value)
        except ValueError:
            return value

ip = "127.0.0.1"
port = 12345

osc = udp_client.SimpleUDPClient(ip, port)

# get individual messages
messages = sys.argv[1].split('\n')
# iterate messages
for m in messages:
    message = m.split(' ')
    command = message.pop(0)
    if len(command) == 0: continue # skip empty messages
    address = "/loopier/clip/clip/" + command
    args = []
    for item in message:
        item = convertType(item)
        args.append(item)

    osc.send_message(address, args)
    log.info("\n[OSC " + ip + ":" + str(port) + "] " + address + " " + str(args))
sys.exit(0)
