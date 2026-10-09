# Data sources

## CTA 'L' stations (Oak Park and adjacent)
- Source: City of Chicago Data Portal, "CTA - 'L' (Rail) Stations", dataset 8pix-ypme: https://data.cityofchicago.org/resource/8pix-ypme.json
- Retrieved: 2025-10-09 (the raw query returned 302 rows; the fetch used $limit=5000)
- Filter: rows with coordinates in lat 41.86–41.92, lon -87.84 to -87.75; one entry per map_id; line flags from the source's red/blue/brn/g/o/p/pexp/y/pnk columns.
- Result: 10 stations, saved in `cta_l_stations_oak_park.json`.
- Not every station is inside Oak Park's city limits (Austin and Harlem/Lake sit on the border), so the UI calls the list "Stations near Oak Park".
- Not included: live arrival times (needs a CTA Train Tracker key and a server-side proxy), Pace bus routes.
