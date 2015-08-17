# *******************************************************************************************
# ** udpsend.py
# **
# ** Simple tool to emit udp broadcasts. I wrote this python lib for reverse engineering 
# ** the Win-Test network interface
# **
# ** This file does not implement any functionality needed by ARSCTL.
# **
# ** (c) Tobias Wellnitz (DH1TW), 2015
# ********************************************************************************************

from socket import *
 
UDP_IP = "255.255.255.255"
UDP_PORT = 9871
# MESSAGE = 'SETAZIMUTH: "STN1" "" "AUTO" 5 1448\xE2\x00'
# MESSAGE = 'READAZIMUTH: "ROTATOR" "" "" "t7ui" "fsdfds" 5 280 280\xE2'
MESSAGE = 'READAZIMUTH: "ROTATOR" "" "" "t7ui" "fsdfds" 4 280 280'

print "UDP target IP:", UDP_IP
print "UDP target port:", UDP_PORT

def calc_checksum(msg):
    total = 0
    for i in msg:
        total += ord(i)
    total = total % 128
    total += 128 # |0x80 -> +127
    return total

def prepare_msg(msg):
    return msg + chr(calc_checksum(msg))

wt_msg = prepare_msg(MESSAGE)
print wt_msg

cs = socket(AF_INET, SOCK_DGRAM)
cs.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
cs.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)
cs.sendto(wt_msg, (UDP_IP, UDP_PORT))