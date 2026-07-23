# Manifest

Every extension starts with a manifest. Keep it small, explicit, and reviewable.

## Minimal example

```toml
extensionName = "IMAP watcher"
extensionVersion = "1.0.0"
extensionDescription = "README.md"
extensionIcon = "icon.png"

[DataSource]
class = "email"
direction = "read"

[[Triggers]]
event = "email.received"

[[Tools]]
name = "search_mailbox"
input_schema = "schemas/search_mailbox.json"

Tasks = "task"
```

## Required identity fields

| Field | Purpose |
|---|---|
| `extensionName` | Human-readable name. |
| `extensionVersion` | Semantic version used for updates and rollback. |
| `extensionDescription` | Path to the extension README. |
| `extensionIcon` | 128 x 128 PNG icon. |

## Common contract fields

| Field | Purpose |
|---|---|
| `DataSource` | Declares a source class and read/write direction. |
| `Triggers` | Declares events the extension emits or reacts to. |
| `Tools` | Declares callable tools and schemas. |
| `Skills` | Declares markdown skill files. |
| `Tasks` | Declares Task availability or scope. |
| `settings` | Declares install-time configuration fields. |
| `capabilities` | Declares maximum permissions the extension may request. |

## Review checklist

- The manifest is understandable without reading source code.
- Every runtime value is a setting, not a constant.
- Every network destination is specific.
- Every capability has a clear product reason.
- Secret values are marked as secrets.
