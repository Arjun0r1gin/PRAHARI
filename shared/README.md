# Shared Module (`shared/`)

## Purpose
Contains reusable JavaScript class definitions, TypeScript/JSDoc types, validation schemas, and system constants shared across `client/` and `functions/` to prevent schema drift.

## Owner
- **Shared Ownership**: Member 1 (Data & Fusion) & Member 2 (Decision Engine & Analytics)

## Inputs
- Domain entity specifications for Crime, Case, District, Station, Officer, Criminal, Recommendation, Alert, and Risk.

## Outputs
- Reusable domain utility instances (`shared/utils/`), JSON schemas (`shared/schemas/`), and global type definitions (`shared/types/`).

## Dependencies
- Standard JavaScript runtime (Node.js & React ecosystem).
