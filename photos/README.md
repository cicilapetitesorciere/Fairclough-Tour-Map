# Riding photos

One folder per riding, named after the riding (e.g. `beaches-east-york/`), with
the images numbered in display order. `ridings.geojson` lists them in each
feature's `photos` array, and the map shows them in the riding's pop-up.

The photos come from the campaign's "Website Riding Tracker" Dropbox folder.
They are resized to 1400px on the long edge and converted to JPEG, and their
metadata is stripped — phone photos carry GPS coordinates, and these are
published on a public page.

Each folder also has a `thumbs/` subfolder with a 96px square copy of each photo, under the same
file name. The map draws these small circles instead of the full images, which keeps it fast.
When you add a photo, add its thumbnail too (centre-cropped square, about 96px, JPEG).
