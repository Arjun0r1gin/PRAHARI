# Data Fusion Function (`functions/data-fusion`)

## Purpose
Normalizes heterogeneous crime FIRs, offender lists, and officer logs across police stations with distinct schemas and date formats into a single standardized record shape.

## Owner
- **Primary Owner**: Member 1 (M1 - Data & Fusion)

## Inputs
- Station feeds from Whitefield, HAL, Bellandur, and Indiranagar stations under `data/districts/`.

## Outputs
- Canonical unified crime objects conforming to `schema/unified-record-schema.js`.

## Dependencies
- `shared/utils/`
- `config/stations.json`
