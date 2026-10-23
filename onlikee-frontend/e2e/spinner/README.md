# Spinner browser QA

This isolated fixture imports the real components and theme CSS without the app's
login/bootstrap/API calls. It does not deploy anything or use production secrets.
The separate `Spinner browser QA (PR only)` workflow has only `contents: read`,
checks out the exact PR head and base, and never modifies the deployment workflow.

## Run

Install dependencies in both checkouts. In the head frontend directory:

```sh
npx playwright install --with-deps chromium
node e2e/spinner/sandbox.mjs
SPINNER_BASE_ROOT=/absolute/path/to/base/onlikee-frontend npm run test:browser
```

Chromium is explicitly launched with `chromiumSandbox: true`. The startup probe
checks that no sandbox-disabling flags were supplied and that a renderer starts.
A platform that cannot run this configuration must fail; do not add `--no-sandbox`,
change sysctls/AppArmor, or modify setuid helper permissions to make it green.

## Evidence and comparison policy

The same harness runs against separately resolved base/head source trees, using
ports 5175/5174. The baseline is captured from the PR base on the same runner,
browser, viewport, theme and motion setting as the head. It is never generated
from the head, checked in as a new golden, or auto-accepted after a mismatch.
Comparisons allow zero differing pixels (Playwright's default color threshold).
Animation phase is frozen only for screenshots; motion preference and timing
contracts are tested separately with browser media emulation and a controlled clock.
Both base/head images are attached even on success; mismatches produce diffs.

The matrix covers light/dark, normal/reduced motion, desktop/390px, body/input
loading modes, ready/loading compositions and open SelectPanel. Interactions
cover sizes, accessible names, repeated loading, input value/focus preservation,
keyboard active descendants, panel close/reopen/focus restoration and delay remount.
The upstream reduced-motion contract retains rotation; this test does not invent a
requirement to stop it. These are browser DOM assertions, not spoken-output tests.

Download the artifact from the exact-head workflow run. Inspect `spinner-report`
with `npx playwright show-report`, the base/head images, mismatch diffs and any
failure traces. Check `spinner-revisions.txt` and `spinner-sandbox.json` first.
A passing pixel comparison establishes parity with the base, not visual quality;
a human/agent still must inspect the screenshots for clipping, overlays and layout.
Actual screen-reader testing remains unperformed until a real reader session is used.
The new fixture does not assert Primer React's current release or replace full-app QA.
