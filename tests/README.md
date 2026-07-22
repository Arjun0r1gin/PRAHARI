# Test Suites (`tests/`)

## Purpose
Contains automated unit tests, integration test suites across serverless functions, simulation verification tests, and performance load tests.

## Owner
- **Shared Responsibility**: Members 1, 2, 3, and 4

## Structure
- `unit/`: Per-function unit tests mirroring the `functions/` tree.
- `integration/`: Cross-module workflow tests (Data Fusion -> Risk Engine -> Audit Log).
- `simulation/`: Validates simulated event stream conformity to unified schemas.
- `performance/`: Load tests for realtime event streams under high throughput.

## Commands
```bash
npm test
```
