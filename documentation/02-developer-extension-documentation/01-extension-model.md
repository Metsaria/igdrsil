# Extension Model

## What an extension is

An Igdrsil extension is a package that declares what it does in a manifest and optionally runs local code under the Igdrsil supervisor.

Common extension types:

- **DataSource**: watches or reads a source and emits items into Igdrsil.
- **Trigger**: reacts to events or item metadata.
- **Tool**: exposes callable functionality to agents, usually through an MCP-shaped interface.
- **Skill**: packages agent instructions or domain knowledge.
- **Pipeline**: wires sources, triggers, agents, and Task output together.

## Hard sovereignty rules

These rules are not optional:

1. Do not transmit customer content to a developer-controlled endpoint.
2. Do not add telemetry, analytics, or hidden phone-home behaviour.
3. Do not hardcode customer paths, hosts, credentials, or tokens.
4. Do not use plugin-authored UI for settings. The host renders settings from the manifest.
5. Request only the capabilities the extension actually needs.
6. Fail closed when a permission, setting, secret, or trust check is missing.

## Runtime boundary

The customer installation owns execution. The App Store or curator channel distributes signed artifacts; it does not receive customer data. The customer's Agent Server validates, installs, configures, and supervises the extension locally.
