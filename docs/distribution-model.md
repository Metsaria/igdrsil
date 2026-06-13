# Distribution Model — Locked

**Date locked:** 2026-06-12
**Decision route:** Founder verdict on OQ (cofounder synthesis)
**Founder words (verbatim):** *"option B we are following our values no shortcuts"*

## What this document is

The locked decision on **how Igdrsil ships from the build machine to the
customer's box.** Future contributors who consider routing artefacts
through `raw.githubusercontent.com`, "branch-based channels," or any
other shortcut should read this first.

## The decision

Igdrsil v1 ships via **GitHub Releases on `Metsaria/igdrsil`** with a
single channel named `stable`.

Each release is a **tagged release on the repo**, not a file on a
branch. Customers fetch artefacts from release-asset URLs of the form:

```
https://github.com/Metsaria/igdrsil/releases/download/<tag>/<asset>
```

The `<tag>` for v1 is `stable`. Future channels (`beta`, `nightly`,
explicit version tags like `v1.0.0`) reuse the same shape with
different tag names.

## What this preserves

Three properties that the architect locked in OQ-027 closure
(plan/PROJECT-STATE.md, 2026-06-11):

1. **Atomic versioning.** Tagging a release pins all assets to that
   version simultaneously. We can never have a half-rolled-out manifest
   pointing at binaries that haven't been signed yet, or a binary
   pointing at a manifest with a different model list.

2. **Rollback path.** If `stable` ships a broken artefact, we move the
   `stable` tag to a previous commit. Clients re-fetching get the old
   artefact. No customer is left holding a partially-broken state.
   Branch-based distribution (Option A) breaks this — every push
   immediately mutates what customers fetch, with no rollback handle.

3. **Trust on tagging, not branch HEAD.** The release-signing pipeline
   (per `plan/PRERELEASE-STEPS.md` item 2) verifies signatures at the
   tag, not at branch HEAD. Branch-pushed artefacts can drift
   silently; tag-published artefacts cannot.

## What was rejected and why

**Option A — `raw.githubusercontent.com` subfolder fetch.**

```
https://raw.githubusercontent.com/Metsaria/igdrsil/main/installer/model-registry.json
```

Pros (claimed): simpler, no release-tagging step, instant updates on push.

Why rejected:
- "Instant updates on push" is not a feature, it's a footgun. A bad
  commit on `main` immediately breaks every customer's installer.
- No rollback semantics. Reverting the commit fixes the future, but
  any client mid-fetch during the bad window saw the bad file.
- Loses the "stable channel" abstraction. We'd have to invent it back
  with branch protection, signed-commit gates, and ad-hoc tooling —
  rebuilding what Releases gives us for free.
- Architect §11.3 in WP-INSTALLER explicitly named the release-channel
  shape; deviating without a real reason is shortcut culture.

**Option C — sandbox + `/usr/local/bin/` install (rejected earlier
in OQ-036).**

This is a related decision documented separately. The sandbox-OFF
posture pairs with Developer-ID + notarized binaries — both consistent
with the GitHub-Releases distribution path here.

## Trust model end-to-end

```
                    ┌───────────────────────────────────────────────┐
                    │  Founder's box (or v1.1+ CI)                  │
                    │                                                │
                    │  1. Build artefact (manifest / binary)         │
                    │  2. Sign with Ed25519 / Apple Dev ID / EV cert │
                    │  3. Verify signature locally                   │
                    └─────────────────┬─────────────────────────────┘
                                      │
                                      │  git push + gh release upload
                                      ▼
                    ┌───────────────────────────────────────────────┐
                    │  github.com/Metsaria/igdrsil/releases/stable  │
                    │                                                │
                    │  ASSETS: model-registry.json,                  │
                    │          igdrsil-macos-arm64.dmg, ...          │
                    └─────────────────┬─────────────────────────────┘
                                      │
                                      │  HTTPS GET (single egress)
                                      ▼
                    ┌───────────────────────────────────────────────┐
                    │  Customer's box — Igdrsil installer            │
                    │                                                │
                    │  1. Fetch artefact from pinned release URL    │
                    │  2. Verify signature against pinned pub key   │
                    │  3. Fail-closed on any verification failure   │
                    └───────────────────────────────────────────────┘
```

The pinned pub key + pinned URL together form the trust anchor. A
compromise of the GitHub repo alone is **not sufficient** to ship a
malicious manifest — the attacker would also need the Ed25519 priv
key (Q26 vault custody) or the Developer ID / EV cert.

## What would force re-evaluation

This decision should be revisited only if:

- GitHub deprecates Releases or changes the release-asset URL shape
  (vanishingly unlikely)
- We introduce a true offline / air-gapped distribution mode (deferred
  to v1.6 per OQ-027 Q1)
- The release-signing pipeline (`plan/PRERELEASE-STEPS.md` item 2)
  is established and chooses a different artefact host

Until then: **GitHub Releases. Tagged. Signed. No shortcuts.**

## See also

- `../README.md` — repo-top-level structure
- `../installer/README.md` — manifest-specific upload runbook
- `plan/PRERELEASE-STEPS.md` — cert procurement + CI/CD establishment
  (the founder-action queue for v1.1+ release pipeline)
- `plan/PROJECT-STATE.md` §5 OQ-027 closure (2026-06-11) — the
  original architect ruling on the channel-shape
- `plan/strategy.md` — the values this decision concretises

---

## §X — 2026-06-12 amendment: B vs C verdict

**Verdict:** **B stands. The fix is `gh release upload`, not a URL change.**

### Why — values, not vibes

A new "Option C" was floated in conversation: pin the installer at
`https://raw.githubusercontent.com/Metsaria/igdrsil/stable/installer/model-registry.json`.
Tag-pinned, not branch-pinned, so it is genuinely *not* the rejected
Option A from §"What was rejected and why" (lines 53–70). The argument
for C is real: the file already exists at the `stable` tag (curl confirms
1689 bytes of signed manifest), B's release-asset URL currently 404s
because the tag was pushed without `gh release upload`, and one line
edit in `manifest_fetcher.dart:57-58` makes the installer work today.

That argument is rejected.

**Sovereignty.** Both URLs hit `github.com`. Sovereignty is unmoved.
Not the discriminator.

**Craftsmanship — the load-bearing value here.** strategy.md line 28–30:
*"Grow slower if needed — never compromise core values for short-term
growth."* Option C is the textbook short-term-growth compromise: skip
the upload step today, eat a structural property forever. The structural
property C loses is **asset immutability under the publish gate**.

  - With B, an asset uploaded to a release tag is content-addressed at
    GitHub's storage layer. `gh release upload` is the publish event.
    Re-pointing requires `gh release delete-asset` + re-upload — two
    explicit, audited, fail-noisy operations. Force-pushing the tag
    does not change the asset.
  - With C, the URL resolves through `raw.githubusercontent.com`, which
    serves whatever blob the tag points at *right now*. `git tag -f
    stable <new-sha> && git push -f origin stable` from any laptop with
    repo write access silently re-points production. No publish event.
    No second gate. No audit trail beyond the reflog.

Re-read §"Trust model end-to-end" line 110–113: *"A compromise of the
GitHub repo alone is **not sufficient** to ship a malicious manifest —
the attacker would also need the Ed25519 priv key."* That sentence is
true under B. Under C it is **less true** — repo write access alone
silently flips what every customer fetches, and the only thing standing
between that flip and a customer install is the Ed25519 signature on
the *current* file. Lose the signing key once, and C gives the attacker
a permanent silent-redistribution channel via tag force-push that
survives key rotation. B does not.

We don't trade structural guarantees for command-line friction. That is
exactly the line strategy.md draws.

**Democratisation.** Neutral. The customer's installer experience is
identical under B and C — same domain, same TLS, same signature
verification path. The friction is on *our* side, where it belongs.
strategy.md line 24–27: *"the worker never feels the complexity we
absorb for them."* Absorbing the upload step is us doing our job.

### Is "asset upload friction" a feature or a bug?

**Feature. The cofounder is right.**

This is the publish gate. Under B, shipping a new manifest requires
*two* deliberate acts:

  1. Commit + push the file to the repo (engineering act).
  2. `gh release upload` to the `stable` tag (publish act).

These are separable on purpose. Step 1 puts the file under version
control. Step 2 declares it shippable. A careless `git push -f origin
stable` from a dirty working tree does *nothing* to customers — the
release asset is unchanged. That separation is the difference between
a repo and a release channel. Collapsing it (which is what C does) is
how you end up shipping a half-finished WIP because someone rebased.

The friction is also one command, performed by one human (the founder,
per Q26 vault custody), at a moment when they are deliberately cutting
a release. That is not a UX problem. It is a deliberate stop sign.

If the friction ever does become a real cost — when CI takes over the
release pipeline per `plan/PRERELEASE-STEPS.md` item 2 — the upload
step gets automated *behind* the same publish gate. The gate stays;
only the hand on the keyboard changes.

### Force-push hazard under C — named, not mitigated

If we chose C, the only real mitigation would be GitHub branch/tag
protection rules forbidding force-push on `stable`, plus required
status checks before tag movement. That rebuilds — badly — the publish
gate that releases give us natively. §"What was rejected and why" line
67–69 already called this out for Option A: *"We'd have to invent it
back with branch protection, signed-commit gates, and ad-hoc tooling —
rebuilding what Releases gives us for free."* C inherits the same
indictment. Not chosen.

### Force-push hazard under B — confirmed mitigated

Under B, force-pushing the `stable` tag is harmless to customers. The
release asset (`model-registry.json` attached to the `stable` release)
is what `https://github.com/Metsaria/igdrsil/releases/download/stable/model-registry.json`
resolves to. Tag movement does not move the asset. To swap what
customers fetch, an actor must call `gh release delete-asset` *and*
`gh release upload` — both of which require the same repo-write scope
the founder's PAT already constrains, and both of which are auditable
events in GitHub's audit log under "Release". The mitigation is
structural and already in place.

### Concrete next action

**Pinned URL stays:**
```
https://github.com/Metsaria/igdrsil/releases/download/stable/model-registry.json
```
(`igdrsil/client/lib/data/installer/manifest_fetcher.dart:57-58`,
unchanged.)

**Action:** founder runs the upload, on the founder's box (Q26 vault
custody — the signing key never leaves that machine, so the publish
event must originate there).

**Exact command sequence** (run from a clone of `Metsaria/igdrsil`
where `installer/model-registry.json` is the signed envelope already
verified locally):

```bash
# 1. Sanity-check the file you are about to publish.
sha256sum installer/model-registry.json
wc -c installer/model-registry.json   # expect ~1689 bytes

# 2. Verify the release exists at the current stable tag.
gh release view stable --repo Metsaria/igdrsil

# 3. Upload (or replace) the manifest as a release asset.
#    --clobber replaces an existing asset with the same name; safe
#    because the publish event is still explicit and audited.
gh release upload stable installer/model-registry.json \
  --repo Metsaria/igdrsil \
  --clobber

# 4. Verify the asset is reachable at the pinned URL.
curl -fsSL -o /tmp/manifest-check.json \
  https://github.com/Metsaria/igdrsil/releases/download/stable/model-registry.json
wc -c /tmp/manifest-check.json   # must match step 1
sha256sum /tmp/manifest-check.json   # must match step 1

# 5. Discard the local copy.
rm /tmp/manifest-check.json
```

Step 4 is the gate. If it does not return the byte-identical signed
envelope, do not proceed — the installer will fail closed on every
customer box, which is the correct behaviour but means v1 ship is
blocked until the upload resolves.

**No code change. No URL change. No architecture change.** The locked
architecture is correct; the missing step is operational. Cofounder
executes — or, since custody of the Q26-vault-streamed signing key
sits with the founder, cofounder hands the command sequence to the
founder for the publish act and verifies step 4 from any box.

— da-architect, 2026-06-12
