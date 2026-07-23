# IMAP Reference Extension

The IMAP extension is the reference pattern for a local DataSource extension.

## Purpose

It connects to an IMAP mailbox, detects relevant messages, and emits email items into Igdrsil for downstream Tasks or agents.

## Runtime expectations

- Runtime: Dart subprocess owned by the local supervisor.
- Interface: host-minted bus credentials and manifest-declared tools.
- Test mode: synthetic data only; no live mailbox and no customer mail.
- Security floor: IMAPS on port 993, TLS 1.2 or newer, modern authentication by default.

## Minimal settings

- `imap_host`: host name.
- `imap_port`: port, default `993`.
- `imap_username`: mailbox user.
- `imap_password`: secret stored in the host secret store.
- `imap_folder`: mailbox folder, default `INBOX`.

## Local checks

From the extension folder, run the deterministic test mode before using a real mailbox:

```bash
dart run bin/imap_extension.dart --test-mode synthetic
```

If tests exist for the extension, run them as well:

```bash
dart run test/imap_extension_example_test.dart
```

## Redaction rule

Test output, logs, status responses, and errors must never expose mailbox contents, credentials, tokens, raw headers, attachment content, message bodies, or local file paths.
