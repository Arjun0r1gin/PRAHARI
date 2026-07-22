# PRAHARI Repository Directory Structure

This document outlines the complete directory layout, folder hierarchy, and file locations for the **PRAHARI** platform.

```
prahari/
├── .catalystrc                                                 # Catalyst CLI configuration
├── .env.example                                                # Environment variables template
├── .gitignore                                                  # Git ignore patterns
├── CHANGELOG.md                                                # Architecture version history
├── LICENSE                                                     # Project license
├── README.md                                                   # Top-level project README
├── catalyst.json                                               # Catalyst project metadata
├── PROJECT_STRUCTURE.md                                        # This repository structure reference
│
├── config/                                                     # Centralized Application Configurations
│   ├── crime-types.json                                        # IPC/BNS crime codes and severities
│   ├── districts.json                                          # Statewide district metadata & statuses
│   ├── risk-thresholds.json                                    # Severity bands, SLAs, and risk weights
│   ├── simulation.json                                         # Stream speed and event generation params
│   └── stations.json                                           # Police station codes and adapter mappings
│
├── docs/                                                       # Architecture, PRD, & Trackers
│   ├── DEVELOPMENT_STATUS.md                                   # Module progress matrix (M1-M4)
│   ├── FUTURE_FEATURES.md                                      # Post-MVP feature backlog
│   ├── PRAHARI_Full_Report.docx                                # Datathon comprehensive report
│   ├── PRAHARI_PRD.docx                                        # Product Requirements Document
│   ├── api-contracts.md                                        # Locked Phase 1 API specifications
│   ├── architecture.md                                         # Architecture, diagrams, & conventions
│   ├── data-model.md                                           # Entity-relationship specification
│   ├── dataset-specification.md                                # CSV schema definitions per station
│   ├── deployment.md                                           # Production deployment guide
│   ├── fusion-workflow.md                                      # Normalization algorithm workflow
│   ├── future-roadmap.md                                       # Plug-in feature mapping
│   ├── simulation-guide.md                                     # Demo playback tuning guide
│   └── system-design.md                                        # Data flow & component diagrams
│
├── client/                                                     # Member 3: Frontend UI (React)
│   ├── client-package.json                                     # Client dependencies
│   ├── build/                                                  # Production build artifact folder
│   ├── public/
│   │   └── index.html                                          # HTML entry point
│   └── src/
│       ├── App.jsx                                             # Main React application router
│       ├── index.jsx                                           # React rendering entry
│       ├── api/                                                # Client API service clients
│       │   ├── auditApi.js
│       │   ├── decisionEngineApi.js
│       │   ├── fusionApi.js
│       │   ├── outcomeApi.js
│       │   └── simulationApi.js
│       ├── components/                                         # Reusable UI widgets
│       ├── screens/                                            # Dashboard screens
│       │   ├── ActionQueue/                                    # Priority dispatch workspace
│       │   ├── AdminConsole/                                   # System admin configuration
│       │   ├── AuditLog/                                       # Operational event log
│       │   ├── HotspotMap/                                     # Spatial risk map view
│       │   ├── InvestigationWorkspace/                         # Suspect/case deep dive
│       │   ├── LiveFeed/                                       # Real-time incident stream
│       │   ├── NetworkGraph/                                   # Crime syndicate visualizer
│       │   ├── ReportExport/                                   # Case dossier generator
│       │   ├── RiskDetail/                                     # Risk breakdown view
│       │   └── StateOverview/                                  # Statewide digital twin map
│       ├── state/                                              # React state management
│       └── styles/                                             # Global CSS & themes
│
├── functions/                                                  # Serverless Backend Functions
│   │
│   ├── data-fusion/                                            # Member 1: Data Fusion Engine
│   │   ├── README.md                                           # Data fusion module documentation
│   │   ├── catalyst-config.json                                # Catalyst function configuration
│   │   ├── index.js                                            # Entry handler
│   │   ├── package.json                                        # Function dependencies
│   │   ├── adapters/                                           # Heterogeneous station feeds
│   │   │   ├── bellandur-adapter.js                            # Unix-epoch dates & "Accused" schema
│   │   │   ├── hal-adapter.js                                  # ISO dates & "Offender Name" schema
│   │   │   ├── indiranagar-adapter.js                          # 4th station feed adapter
│   │   │   └── whitefield-adapter.js                           # DD-MM-YYYY dates & "Suspect Name" schema
│   │   ├── schema/
│   │   │   └── unified-record-schema.js                        # Canonical record shape
│   │   ├── controllers/                                        # Request handlers
│   │   ├── services/                                           # Transformation logic
│   │   ├── utils/                                              # Helper utilities
│   │   ├── config/                                             # Adapter configuration
│   │   └── tests/                                              # Unit test cases
│   │
│   ├── risk-engine/                                            # Member 2: Risk Evaluation Engine
│   │   ├── README.md
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── rules/                                              # Threat scoring rules
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── hotspot-engine/                                         # Member 2: Spatial Clustering
│   │   ├── README.md
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── algorithms/                                         # KDE & spatial algorithms
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── network-analysis/                                       # Member 2: Syndicate Graph Analysis
│   │   ├── README.md
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── algorithms/                                         # Centrality & graph algorithms
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── audit-log/                                              # Member 4: Immutable Audit Trail Log
│   │   ├── README.md
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── ocr-ingestion/                                          # Member 1: Scanned Document OCR (Future)
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── outcome-loop/                                           # Member 4: Action Outcome Feedback
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── report-export/                                          # Member 4: Dossier PDF/Doc Generator
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── event-triggers/                                         # Member 4: Real-time Event Broadcaster
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   ├── auth-hooks/                                             # Member 4: Authentication & RBAC Hooks
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tests/
│   │
│   └── notifications/                                          # Member 4: Officer Alert System (Future)
│       ├── controllers/
│       ├── services/
│       ├── utils/
│       ├── config/
│       └── tests/
│
├── data/                                                       # Member 1: Statewide Station Datasets
│   ├── README.md
│   ├── districts/
│   │   ├── bangalore-urban/
│   │   │   ├── district.json
│   │   │   └── stations/
│   │   │       ├── whitefield/
│   │   │       │   ├── cases.csv
│   │   │       │   ├── criminals.csv
│   │   │       │   ├── evidence.csv
│   │   │       │   ├── fir.csv
│   │   │       │   ├── officers.csv
│   │   │       │   └── vehicles.csv
│   │   │       ├── hal/
│   │   │       │   ├── cases.csv
│   │   │       │   ├── criminals.csv
│   │   │       │   ├── evidence.csv
│   │   │       │   ├── fir.csv
│   │   │       │   ├── officers.csv
│   │   │       │   └── vehicles.csv
│   │   │       ├── bellandur/
│   │   │       │   ├── cases.csv
│   │   │       │   ├── criminals.csv
│   │   │       │   ├── evidence.csv
│   │   │       │   ├── fir.csv
│   │   │       │   ├── officers.csv
│   │   │       │   └── vehicles.csv
│   │   │       └── indiranagar/
│   │   │           ├── cases.csv
│   │   │           ├── criminals.csv
│   │   │           ├── evidence.csv
│   │   │           ├── fir.csv
│   │   │           ├── officers.csv
│   │   │           └── vehicles.csv
│   │   ├── mysuru/
│   │   │   └── district.json
│   │   ├── mangaluru/
│   │   │   └── district.json
│   │   ├── belagavi/
│   │   │   └── district.json
│   │   └── kalaburagi/
│   │       └── district.json
│   ├── generators/                                             # Synthetic data generators
│   │   ├── generate-station-a.py
│   │   ├── generate-station-b.py
│   │   └── generate-station-c-scanned.py
│   └── seed/                                                   # Raw database seed files
│
├── simulation/                                                 # Member 4 & 1: Real-Time Simulation Engine
│   ├── README.md
│   ├── crime-generator/                                        # Synthetic crime generator
│   ├── event-generator/                                        # Shared event timing emitter
│   ├── incident-stream/                                        # Timestamped event stream
│   ├── patrol-generator/                                       # Officer patrol movement stream
│   ├── realtime-feed/                                          # WebSocket stream pusher
│   └── scheduler/                                              # Playback speed & control
│
├── shared/                                                     # Shared Entities, Schemas, & Constants
│   ├── README.md
│   ├── constants/                                              # System lookup codes
│   ├── schemas/                                                # Validation schemas
│   ├── types/                                                  # Type definitions
│   └── utils/                                                  # Domain helper classes
│       ├── Alert.js
│       ├── Case.js
│       ├── Crime.js
│       ├── Criminal.js
│       ├── District.js
│       ├── Officer.js
│       ├── Recommendation.js
│       ├── Risk.js
│       └── Station.js
│
├── models/                                                     # Member 2: Serialized Model Artifacts
│   ├── README.md
│   ├── explainability/                                         # Feature importance artifacts
│   ├── hotspot/                                                # Serialized hotspot models
│   ├── network/                                                # Graph centrality models
│   ├── prediction/                                             # Forecast models
│   └── recommendation/                                         # Ranking models
│
├── analytics/                                                  # Member 2: Algorithm Research & Pipelines
│   ├── README.md
│   ├── correlation/                                            # Cross-station pattern correlation
│   ├── hotspot/                                                # Experimental spatial clustering
│   ├── network/                                                # Graph algorithms
│   ├── prediction/                                             # Predictive trend models
│   └── trend/                                                  # Time-series analysis
│
├── assets/                                                     # Member 3 & 1: Static GeoJSON Map Assets
│   ├── README.md
│   └── maps/
│       └── geojson/
│           ├── districts.geojson                               # District boundary shapes
│           ├── police_stations.geojson                         # Station marker locations
│           └── ward_boundaries.geojson                         # Ward boundary polygons
│
├── scripts/                                                    # Operational & Deployment Shell Scripts
│   ├── deploy.sh                                               # Build & deploy script
│   ├── run-local.sh                                            # Local dev environment launcher
│   └── seed-db.sh                                              # Database seeding script
│
├── tests/                                                      # Automated Test Suites
│   ├── README.md
│   ├── integration/                                            # Cross-module workflow tests
│   ├── performance/                                            # Event stream load tests
│   ├── simulation/                                             # Stream schema validation tests
│   └── unit/                                                   # Per-function unit tests
│
├── deployment/                                                 # Member 4: Production Infrastructure
│   ├── README.md
│   ├── docker/                                                 # Container definitions
│   ├── logging/                                                # Central logging configs
│   ├── monitoring/                                             # Dashboard & alert rules
│   └── terraform/                                              # IaC scripts
│
└── demo/                                                       # Datathon Walkthrough & Presentation Assets
    ├── demo-dataset.json                                       # Curated demo dataset snapshot
    ├── demo-script.md                                          # Rehearsed demo script
    ├── judge-questions.md                                      # Judge Q&A reference
    ├── datasets/
    ├── screenshots/
    ├── scripts/
    └── videos/
```

## Member Ownership Matrix

| Member | Focus Area | Primary Directories |
| :--- | :--- | :--- |
| **Member 1 (M1)** | Data & Fusion Layer | `functions/data-fusion/`, `functions/ocr-ingestion/`, `data/`, `shared/` |
| **Member 2 (M2)** | Decision Engine & Analytics | `functions/risk-engine/`, `functions/hotspot-engine/`, `functions/network-analysis/`, `models/`, `analytics/` |
| **Member 3 (M3)** | Frontend UI | `client/`, `assets/maps/geojson/` |
| **Member 4 (M4)** | Platform Infrastructure & Real-Time | `functions/audit-log/`, `functions/outcome-loop/`, `functions/report-export/`, `functions/event-triggers/`, `functions/auth-hooks/`, `functions/notifications/`, `simulation/`, `deployment/`, `config/` |
