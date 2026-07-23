# Build, Test, and Submit

## Local development loop

1. Create the manifest.
2. Add the smallest runtime code needed.
3. Keep all hostnames, paths, credentials, and tokens in settings.
4. Run local extension tests.
5. Validate the manifest.
6. Run the extension in test mode.
7. Confirm no customer content, settings, secrets, prompts, task names, file paths, logs, credentials, Matrix IDs, or model output are transmitted to developer infrastructure.

## Manifest validation

If the Igdrsil CLI is available, validate the manifest before submission:

```bash
igdrsil extension validate <path-to-extension>
```

Expected exit codes:

- `0`: manifest valid.
- `1`: parse or validation error.
- `2`: usage error.

## Submission model

Developers submit source from a GitHub repository at an exact commit. Customer-facing binaries are built, reviewed, signed, and published by the Igdrsil-controlled channel. Developers do not sign the artifact customers install.

## Before submission

Answer yes to all of these:

- Are all runtime values settings?
- Are all secrets marked secret?
- Is network egress specific and minimal?
- Does the extension run without telemetry?
- Does denied permission fail closed?
- Does the README explain what data the extension reads and why?
- Have you tested the extension without live customer data?
