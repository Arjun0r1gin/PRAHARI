# Simulation Engine (`simulation/`)

## Purpose
Provides synthetic event generation, incident streaming, and patrol playback capabilities for testing, demonstration pacing, and evaluation of the PRAHARI predictive policing workflow.

## Owner
- **Primary Owner**: Member 4 (M4 - Platform & Real-Time)
- **Schema Owner**: Member 1 (M1 - Data & Fusion)

## Inputs
- District and station metadata from `data/districts/` and `config/simulation.json`.
- Event generation rules and synthetic crime profiles.

## Outputs
- Timestamped event stream pushed via `realtime-feed/` and Catalyst WebSocket triggers (`event-triggers/`).
- Synthetic FIR records and officer movement telemetry.

## Dependencies
- `shared/schemas/` (Unified FIR and Event payloads)
- `shared/constants/` (District/Station lookup codes)
- `config/simulation.json`
