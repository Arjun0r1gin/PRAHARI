# Audit Log Function (`functions/audit-log`)

## Purpose
Records immutable event trails for system actions, risk overrides, officer recommendations, and platform operations to ensure transparency and accountability.

## Owner
- **Primary Owner**: Member 4 (M4 - Platform & Real-Time)

## Inputs
- Operational events triggered across frontend user interactions and backend decision engines.

## Outputs
- Append-only audit log records for the Audit Log UI screen (`client/src/screens/AuditLog`).

## Dependencies
- Catalyst Data Store / Relational Event Store
