const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "assets", "main.js"), "utf8");

function affiliateTags() {
  return Array.from(
    html.matchAll(/<a\b[^>]*\bdata-affiliate(?:[=\s>])[^>]*>/g),
    (match) => match[0]
  );
}

function runMain(search) {
  const anchors = affiliateTags().map((tag) => {
    const attrs = {};
    for (const match of tag.matchAll(/([\w-]+)="([^"]*)"/g)) {
      attrs[match[1]] = match[2];
    }
    return {
      attrs,
      setAttribute(name, value) {
        this.attrs[name] = value;
      },
      getAttribute(name) {
        return this.attrs[name] || null;
      },
      addEventListener() {}
    };
  });
  const stored = {};
  const context = {
    URLSearchParams,
    window: {
      location: { search },
      sessionStorage: {
        getItem(key) {
          return stored[key] || null;
        },
        setItem(key, value) {
          stored[key] = value;
        }
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
