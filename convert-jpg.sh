#!/bin/bash

#Usage 
# ./convert-jpg.sh "/home/rephus/thumbnails/SNK - Neo Geo/Named_Snaps"

folder=$1
  for file in "$folder"/*.jpg
  do
    echo "file $file"
    outfile=$(basename "$file" .jpg)
    echo "outfile $outfile"
    convert -resize  320x256 "$file" "$folder/$outfile.png"
    rm "$file" 
    #echo convert -verbose "'$file'" -rotate 90 \
    #+profile "'*'" "'$outfile'"
  done #| gm batch -echo on -feedback on -
