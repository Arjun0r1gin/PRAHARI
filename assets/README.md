# Static Assets & GeoJSON Maps (`assets/`)

## Purpose
Contains GeoJSON boundary files for districts, police station point locations, and ward boundaries used by the HotspotMap and StateOverview screens.

## Owner
- **Consumer**: Member 3 (M3 - Frontend UI)
- **Source of Truth**: Member 1 (M1 - Data & Fusion)

## Inputs
- Official administrative GeoJSON boundary files.

## Outputs
- Renderable spatial map layers for `client/src/screens/HotspotMap` and `StateOverview`.

## Dependencies
- Leaflet / Mapbox / OpenLayers web mapping library in React.
