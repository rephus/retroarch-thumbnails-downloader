#!/bin/bash

# Usage 
# bash run.sh "/home/playlists/SNK - Neo Geo.lpl" "/home/thumbnails/SNK - Neo Geo/Named_Snaps"

playlist=$1
snaps=$2

node main.js "$1" "$2"
echo "Wait 5 seconds for images to be downloaded"
sleep 5
./convert-jpg.sh "$snaps"