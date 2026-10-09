# Oak Park Transit Dashboard

A mobile-friendly dashboard for public transit around Oak Park, Illinois.

## What it shows
- A map of CTA 'L' stations in and around Oak Park (Green and Blue lines), with OpenStreetMap basemap and visible attribution.
- A station list with line badges; selecting a station centers the map on it.

## Data
- `data/cta_l_stations_oak_park.json`, from the City of Chicago Data Portal (CTA 'L' Rail Stations, dataset 8pix-ypme). See `data/SOURCES.md`.

## Not yet included
- Live arrival times (needs a CTA Train Tracker API key, added under Settings → Secrets, and a server-side proxy).
- Pace bus routes and stops.
