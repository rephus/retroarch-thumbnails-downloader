Script to downloads all missing images for a playlist on Retroarch

## Usage

node main.js <playlist file> <thumbnail folder>

node main.js "~/.config/retroarch/playlists/SNK - Neo Geo.lpl" "~/thumbnails/SNK - Neo Geo/Named_Snaps"

## How it works

The script reads the playlist file, and checks the game titles in there, then it dowloads asynchronously a screenshot image from duck duck go, and saves it into the thumbnail folder specified in the argument

## Convert jpg to png 

There is another bash script that converts all .jpg images (not supported by retroarch) into .png. 

Requires imagemagick binaries to work


