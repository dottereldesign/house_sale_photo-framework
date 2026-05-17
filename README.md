# House Photo Board

A static photo planning board for rental listing photos. It runs entirely in the browser, so it can be hosted on GitHub Pages for free.

## Use

Open `index.html` in a browser, or publish the repository with GitHub Pages. The root page is the rental launch homepage. The photo board lives at `/photography/`.

In the photo board, add photos into each room folder as either `Reference` images or real `Listing` photos, mark each folder as `To shoot`, `Needs more`, or `Complete`, and use `All photos` to review the full set. On phones, use `Take listing photo` to open the camera directly, or `Choose listing photos` to pick existing photos from the device.

Reference images are for examples, angles, styling cues, or reminders. Listing photos are the real rental photos. Listing photos can be marked as `Final shot`, and each photo can have a version label such as `v1`, `wide`, `edited`, or `final crop`.

Photos are stored locally in the browser with IndexedDB. Use `Export` to save a backup JSON file before clearing browser data or moving to another computer.

## Trade Me reference photos

Put downloaded example images in `~/Downloads/trademephotos`. Name files with the room in the filename, such as `lounge 2.jpg`, `hallway.jpg`, or `outside - side shot.jpg`.

Generate a merge import file once:

```bash
node scripts/watch-trademe-photos.js --once
```

Or keep watching the folder while you download images:

```bash
node scripts/watch-trademe-photos.js
```

Then run the app with a local server and click `Load refs`. Matched files are added as `Reference` images without deleting existing listing photos.

## GitHub Pages

1. Push this repository to GitHub.
2. Go to the repo settings.
3. Open `Pages`.
4. Set the source to deploy from the `main` branch and `/root`.
5. Open the GitHub Pages URL after the deployment finishes.

## Practical photo workflow

- Take photos on the phone in landscape and portrait where useful.
- Transfer them to the laptop with AirDrop, USB, iCloud Photos, Google Photos, or another normal file transfer flow.
- Put the transferred files in a temporary Finder folder.
- Drag batches into the matching folders in this app.
- Use `All photos` to spot missing rooms, duplicates, dark shots, and inconsistent angles.
- Export a backup once the set is complete.
