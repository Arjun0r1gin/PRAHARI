# Hotspot Engine Function (`functions/hotspot-engine`)

## Purpose
Performs spatial clustering and kernel density estimation (KDE) over geospatial incident coordinates to identify high-density crime hot zones.

## Owner
- **Primary Owner**: Member 2 (M2 - Decision Engine & Analytics)

## Inputs
- Geocoded FIR records from `data-fusion/` and boundary polygons from `assets/maps/geojson/`.

## Outputs
- Spatial risk heatmaps, cluster centroids, and polygon risk intensity levels.

## Dependencies
- `models/hotspot/`
- `assets/maps/geojson/`
