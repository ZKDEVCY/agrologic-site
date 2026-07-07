GreenHub v0.6 - AR Preview

Replace these files with your real images:
1. assets/aloe-field.jpg  -> your aloe vera field homepage background
2. assets/plant1.png      -> your Plant1 cutout image, transparent PNG recommended

Login test credentials:
Username: admin
Password: greenhub
Alternative username: zacharias
Password: greenhub

New feature:
- AR Preview is now clickable from greenhub.html.
- ar-preview.html opens a Select Plant dropdown.
- Plant1 starts the phone camera.
- Plant1 overlay is shown at 60% opacity.
- Take photo with product saves a PNG image combining camera view + product overlay.

Important:
Camera access usually works only when the page is served through HTTPS or localhost.
For local testing, use VS Code Live Server.
For phone testing, upload to GitHub Pages and open the live HTTPS site on your phone.


v0.7 update:
- AR Preview keeps Plant1 as a 2D transparent overlay.
- Plant1 is now manually scalable to simulate room depth: use pinch on mobile or the size slider/buttons.
- Plant1 can now be dragged and positioned so the pot touches the selected floor/table point.
- Photo capture saves the camera frame with the current plant position and scale.
- This is still a simple web MVP, not true depth-aware WebXR/ARCore tracking.
