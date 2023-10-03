#!/bin/sh

# this script assumes you have installed the following:
# - ffmpeg

cd public/sounds
for f in `ls *.mp3`; do
    echo $f

    opus="${f//.mp3/.opus}"
    if [[ ! -e "$opus" || "$f" -nt "$opus" ]]; then
        rm -f $opus
        ffmpeg -hide_banner -loglevel error -y -i $f -map a:0 -c:a libopus -b:a 32k -compression_level 10 -application audio $opus
    fi

    m4a="${f//.mp3/.m4a}"
    if [[ ! -e "$m4a" || "$f" -nt "$m4a" ]]; then
        rm -f $m4a
        ffmpeg -hide_banner -loglevel error -y -i $f -map a:0 -c:a libfdk_aac -b:a 64k $m4a
    fi

    ogg="${f//.mp3/.ogg}"
    if [[ ! -e "$ogg" || "$f" -nt "$ogg" ]]; then
        rm -f $ogg
        ffmpeg -hide_banner -loglevel error -y -i $f -map a:0 -c:a libvorbis -b:a 64k $ogg
    fi
done
