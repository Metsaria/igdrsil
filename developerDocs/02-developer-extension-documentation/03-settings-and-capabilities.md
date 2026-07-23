# Settings and Capabilities

## Settings

Settings are values the customer administrator fills in during install or later in the extension details panel. The host renders the form. The extension supplies schema data only.

```toml
[[settings]]
name = "imap_host"
type = "string"
required = true
label_en = "IMAP host"
description_en = "Host name of the IMAP server."
secret = false
validation = "^[a-z0-9.-]+$"

[[settings]]
name = "imap_port"
type = "integer"
required = true
default = 993
label_en = "IMAP port"
description_en = "TCP port of the IMAP server."
secret = false
validation = { min = 1, max = 65535 }

[[settings]]
name = "imap_password"
type = "string"
required = true
label_en = "IMAP password"
description_en = "Stored in the operating-system keychain."
secret = true
```

## Secret handling

Secret settings do not go into the normal settings file. They are stored through the host secret store, backed by the operating-system keychain. Never log secrets, echo them in errors, return them from status endpoints, or write them to extension-owned files.

## Capabilities

Capabilities declare the maximum permission the extension may receive. They are not grants. The administrator can deny them, and the runtime must enforce that denial.

```toml
[capabilities]
network.egress = ["graph.microsoft.com:443"]
bus.publish = ["email.received.outlook.>"]
bus.subscribe = ["task.created.>"]
```

## Capability rules

- Use exact hosts, not wildcards.
- Do not request internet egress for private customer content unless the product contract explicitly allows it.
- Do not subscribe to broad bus subjects.
- Do not assume a declared capability is granted.
- Show a clear degraded state when a capability is denied.
