# Serialized Models (`models/`)

## Purpose
Stores pre-trained machine learning model artifacts, graph centrality metrics, spatial risk weights, recommendation ranking models, and SHAP explainability matrices used by the Decision Engine functions.

## Owner
- **Primary Owner**: Member 2 (M2 - Decision Engine & Analytics)

## Inputs
- Aggregated crime datasets and historical spatial patterns.

## Outputs
- Serialized model files (`.pkl`, `.onnx`, `.json`) consumed by `hotspot-engine/` and `network-analysis/`.

## Dependencies
- `analytics/` (Model training and validation pipeline)
