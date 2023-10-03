#!/bin/sh

# this script assumes you have installed the following:
# - cwebp

cd public/images
for png in *.png; do
    echo $png

    avif="${png//.png/.avif}"
    if [[ ! -e "$avif" || "$png" -nt "$avif" ]]; then
        echo "$png -> $avif"
        rm -f $avif
        npx avif --input=$png --effort=9 --quality=50

        if [ -e sheet.avif.png ]; then
            mv sheet.avif.png sheet.avif.avif
        fi
    fi

    webp="${png//.png/.webp}"
    if [[ ! -e "$webp" || "$png" -nt "$webp" ]]; then
        echo "$png -> $webp"
        rm -f $webp
        cwebp -quiet -q 75 $png -o $webp
    fi
done

cat sheet.png.json | sed s/sheet.png.png/sheet.avif.avif/g > sheet.avif.json
cat sheet.png.json | sed s/sheet.png.png/sheet.webp.webp/g > sheet.webp.json
