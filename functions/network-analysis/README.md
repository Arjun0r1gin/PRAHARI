# Network Analysis Function (`functions/network-analysis`)

## Purpose
Constructs crime syndicate graphs to analyze offender co-occurrences, accomplice connections, degree centrality, and key gang leadership nodes.

## Owner
- **Primary Owner**: Member 2 (M2 - Decision Engine & Analytics)

## Inputs
- Accused relationship records and shared case co-occurrences across station FIRs.

## Outputs
- Graph centrality metrics, criminal cluster sub-graphs, and syndicate influence scores.

## Dependencies
- `models/network/`
- `shared/utils/Criminal.js`
