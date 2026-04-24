# Security policy

The MVP applies policy before tool execution.

## Default behavior

- Destructive command patterns are blocked.
- Risky commands require confirmation.
- Registry writes are disabled.
- UI clicking is enabled but should require confirmation in production.
- Screenshot capture is not continuous and should be user-visible.

Policy lives in `security/policy/default_policy.json`.
