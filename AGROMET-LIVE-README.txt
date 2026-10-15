AGROMET LIVE v1.2 — LIVE DATA CONNECTOR
=======================================

This package preserves the v1.1 widget layout and GreenHub files.
It replaces the station XML parser with an observation-by-observation parser
matching the documented Cyprus Department of Meteorology API structure.

SOURCE: https://dom.org.cy/AWS/OpenData/CyDoM.xml
Official documentation: https://www.data.gov.cy/el/dataset/trehoyses-katagrafes-meteorologikon-stathmon-api

IMPORTANT: Live measurements are NOT bundled or fabricated. stations.json
remains empty until the GitHub Actions workflow retrieves the official feed.

TO ENABLE:
1. Copy all package files into the existing AGROLOGIC-SITE project.
2. In VS Code Live Server, confirm the widget still looks correct. It will
   display 'Awaiting first station update' until an online workflow succeeds.
3. Commit and push to GitHub main via GitHub Desktop.
4. Open github.com/ZKDEVCY/agrologic-site/actions
5. Select 'AgroMet Live weather observations' > Run workflow > main > Run.
6. Open the run and verify 'Retrieve and normalize official observations'
   and 'Publish station snapshot if changed' both succeed.
7. Verify agromet/stations.json contains station records and actual readings.
8. Wait for GitHub Pages deployment, then check https://agrologic.cy
   on desktop and mobile. Check dropdown and observation timestamps.

NOTE: GitHub Actions must have permission to write repository contents.
If the publish step reports a 403 error, visit repository Settings > Actions
> General > Workflow permissions > Read and write permissions (if available).

The official XML feed is published approximately every 10 minutes, but
scheduled GitHub Actions may run late or skip runs. The widget displays
last source observation and fetch time; it should not be advertised as
second-by-second real-time data.

STATION PROXIMITY: Requires station coordinates in the official feed.
If coordinates are absent, the dropdown still works alphabetically, but
proximity ranking will need a verified official station-coordinate catalog.

LIVE VALIDATION: The official endpoint could not be reached from the
packaging environment. A local synthetic XML test passed. Verify the first
GitHub Actions run before declaring the data integration complete.
