# Risk Engine Function (`functions/risk-engine`)

## Purpose
Evaluates suspect/offender threat levels using weighted composite scoring based on recidivism, crime severity, network centrality, and spatial proximity.

## Owner
- **Primary Owner**: Member 2 (M2 - Decision Engine & Analytics)

## Inputs
- Unified crime records from `data-fusion/` and risk rule parameters from `config/risk-thresholds.json`.

## Outputs
- Risk scores, severity levels (CRITICAL, HIGH, MEDIUM, LOW), and actionable recommendations.

## Dependencies
- `shared/utils/Risk.js`
- `config/risk-thresholds.json`
