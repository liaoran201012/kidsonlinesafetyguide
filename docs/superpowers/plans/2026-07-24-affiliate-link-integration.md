# Affiliate Link Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route exactly four commercial landing-page controls through the supplied Bark affiliate URL while preserving internal navigation and inbound click attribution parameters.

**Architecture:** Mark outbound commercial anchors explicitly with `data-affiliate` in `index.html`. Keep the campaign URL and URL-building behavior centralized in `assets/main.js`, whose selector will target only those marked anchors. A dependency-free Node test will load the production script in a small DOM harness and verify both markup scope and generated outbound URLs.

**Tech Stack:** Static HTML, browser JavaScript (ES5-compatible application code), Node.js built-in `node:test`, `assert`, `fs`, and `vm` modules.

## Global Constraints

- Exactly four commercial links are affiliate links.
- “See how it works” remains an internal link to `#how`.
- Existing affiliate URL query parameters must be preserved.
- Supported Google Ads and UTM parameters must be appended and URL-encoded.
- Affiliate links use `target="_blank"` and `rel="sponsored nofollow noopener"`.
- Existing analytics labels and `cta_click` events remain intact.
- Do not alter page copy, styling, analytics IDs, policy pages, deployment settings, or unrelated files.

---

### Task 1: Explicit affiliate-link wiring and regression coverage

**Files:**
- Create: `tests/affiliate-links.test.js`
- Modify: `index.html`
- Modify: `assets/main.js`

**Interfaces:**
- Consumes: inbound query parameters from `window.location.search`; anchors marked with the boolean `data-affiliate` HTML attribute.
- Produces: outbound `href` values based on `TRACKER_CAMPAIGN_URL`; `target="_blank"` and `rel="sponsored nofollow noopener"` attributes; unchanged `cta_click` events keyed by `data-cta`.

- [x] **Step 1: Write the failing regression test**

Create `tests/affiliate-links.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "assets", "main.js"), "utf8");

function affiliateTags() {
  return Array.from(html.matchAll(/<a\b[^>]*\bdata-affiliate(?:[=\s>])[^>]*>/g), (match) => match[0]);
}

function runMain(search) {
  const anchors = affiliateTags().map((tag) => {
    const attrs = {};
    for (const match of tag.matchAll(/([\w-]+)="([^"]*)"/g)) {
      attrs[match[1]] = match[2];
    }
    return {
      attrs,
      setAttribute(name, value) { this.attrs[name] = value; },
      getAttribute(name) { return this.attrs[name] || null; },
      addEventListener() {}
    };
  });
  const stored = {};
  const context = {
    URLSearchParams,
    window: {
      location: { search },
      sessionStorage: {
        getItem(key) { return stored[key] || null; },
        setItem(key, value) { stored[key] = value; }
      }
    },
    sessionStorage: null,
    document: {
      readyState: "complete",
      querySelectorAll(selector) {
        assert.equal(selector, "a[data-affiliate]");
        return anchors;
      }
    }
  };
  context.sessionStorage = context.window.sessionStorage;
  vm.runInNewContext(script, context);
  return anchors;
}

test("marks exactly the four commercial controls as affiliate links", () => {
  const tags = affiliateTags();
  assert.equal(tags.length, 4);
  assert.deepEqual(
    tags.map((tag) => tag.match(/data-cta="([^"]+)"/)[1]),
    ["nav", "hero", "pricing", "finale"]
  );
  assert.match(html, /class="cta ghost" href="#how"/);
  assert.doesNotMatch(html, /class="cta ghost"[^>]*data-affiliate/);
});

test("preserves offer parameters and appends encoded attribution", () => {
  const anchors = runMain("?gclid=click+one&utm_term=parental%20control");
  for (const anchor of anchors) {
    const url = new URL(anchor.attrs.href);
    assert.equal(url.hostname, "afflat3d2.com");
    assert.equal(url.searchParams.get("o"), "24645");
    assert.equal(url.searchParams.get("c"), "918273");
    assert.equal(url.searchParams.get("a"), "638483");
    assert.equal(url.searchParams.get("l"), "28885");
    assert.equal(url.searchParams.get("gclid"), "click one");
    assert.equal(url.searchParams.get("utm_term"), "parental control");
    assert.equal(anchor.attrs.target, "_blank");
    assert.equal(anchor.attrs.rel, "sponsored nofollow noopener");
  }
});
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```powershell
node --test tests/affiliate-links.test.js
```

Expected: FAIL because no anchors currently have `data-affiliate`, and the script still selects `a.cta`.

- [x] **Step 3: Mark only the four commercial controls**

In `index.html`, add the boolean `data-affiliate` attribute to the anchors with `data-cta="nav"`, `data-cta="hero"`, `data-cta="pricing"`, and `data-cta="finale"`. Do not add it to the `.cta.ghost` anchor:

```html
<a class="nav-cta" data-affiliate data-cta="nav" href="#">Try Bark</a>
<a class="cta" data-affiliate data-cta="hero" href="#">Start a free trial <span class="arrow" aria-hidden="true">→</span></a>
<a class="cta" data-affiliate data-cta="pricing" href="#">Check current pricing <span class="arrow" aria-hidden="true">→</span></a>
<a class="cta on-dark" data-affiliate data-cta="finale" href="#">Start your free trial <span class="arrow" aria-hidden="true">→</span></a>
```

- [x] **Step 4: Configure the offer URL and narrow the selector**

In `assets/main.js`, set:

```js
var TRACKER_CAMPAIGN_URL = "https://afflat3d2.com/trk/lnk/EEEF4C3E-BAEE-4071-A07E-A006C5AB6168/?o=24645&c=918273&a=638483&k=83574FF7E92A367C505AAE60D3FA4C84&l=28885";
```

Update the CTA selector:

```js
var ctas = document.querySelectorAll("a[data-affiliate]");
```

Update the file comment so it describes `data-affiliate` rather than `.cta`.

- [x] **Step 5: Run the focused test and syntax validation**

Run:

```powershell
node --test tests/affiliate-links.test.js
node --check assets/main.js
```

Expected: two passing tests and no syntax errors.

- [x] **Step 6: Review the scoped diff**

Run:

```powershell
git diff --check
git diff -- index.html assets/main.js tests/affiliate-links.test.js
git status --short
```

Expected: no whitespace errors; only the planned files plus the pre-existing `README.md` deletion and plan/spec documentation appear.

- [x] **Step 7: Commit the implementation without unrelated changes**

Run:

```powershell
git add -- index.html assets/main.js tests/affiliate-links.test.js docs/superpowers/plans/2026-07-24-affiliate-link-integration.md
git commit -m "feat: connect Bark affiliate links"
```

Expected: a commit containing the affiliate integration, its regression test, and this plan; the unrelated `README.md` deletion remains unstaged.
