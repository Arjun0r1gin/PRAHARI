# PRAHARI Audit Log Service (`functions/audit-log/`)

This service maintains an **immutable, insert-only audit trail** of all officer actions, system decisions, data fusion ingestion runs, and administrative configuration changes in PRAHARI.

---

## Mandatory Design Constraint: INSERT-ONLY

> [!IMPORTANT]
> The `audit_log` table in Catalyst Data Store is strictly **INSERT-ONLY**. No UPDATE or DELETE operations exist by design. Attempts to mutate or erase logged records are forbidden.

---

## Cross-Module Usage: Importing `logAction()`

Other microservices (such as `outcome-loop`, `risk-engine`, `data-fusion`, and `hotspot-engine`) must record operational events using the exported `logAction` function.

### Node.js Example

```javascript
const { logAction } = require('@prahari/audit-log/services/auditService');
// Or relative import: require('../audit-log/services/auditService');

async function handleOfficerAction(officerId, alertId, decision) {
  // 1. Perform primary business logic...
  
  // 2. Log immutable audit entry
  await logAction(
    officerId,               // actor_id (e.g. 'O-HAL-01' or user_id)
    'ACTION_DISPATCHED',     // action_type (e.g. 'ACTION_ACTIONED' | 'ALERT_REVIEWED' | 'RISK_SCORE_OVERRIDE')
    'alert',                 // target_entity (e.g. 'alert' | 'case' | 'fusion_run')
    alertId                  // target_id (e.g. 'ALT-2025-0891')
  );
}
```

---

## Audit Log Schema (`audit_log` in Catalyst Data Store)

| Field Name | Type | Description |
|---|---|---|
| `log_id` | String (UUID v4) | Primary key for audit entry |
| `actor_id` | String | ID of user, officer, or system component (`system`, `fusion-engine`, `O-HAL-01`) |
| `action_type` | String | Normalized event action code (`ACTION_CREATED`, `CASE_CLOSED`, etc.) |
| `target_entity` | String | Target object type (`alert`, `case`, `person`, `system_config`) |
| `target_id` | String | Target entity unique identifier |
| `timestamp` | Number | Unix epoch milliseconds |

---

## Public REST Endpoint

### `GET /v1/audit-log`

Retrieves filtered audit logs.

#### Query Parameters:
- `actor` (optional): Filter by `actor_id`
- `action_type` (optional): Filter by `action_type`
- `startDate` (optional): Epoch ms or ISO date string lower boundary
- `endDate` (optional): Epoch ms or ISO date string upper boundary

#### Response (200 OK):
```json
{
  "success": true,
  "count": 2,
  "logs": [
    {
      "log_id": "8f3b2a1c-99d8-4a11-b210-990184a29ef1",
      "actor_id": "O-HAL-01",
      "action_type": "ACTION_DISPATCHED",
      "target_entity": "alert",
      "target_id": "ALT-2025-001",
      "timestamp": 1738395600000
    }
  ]
}
```
