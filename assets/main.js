/*
 * main.js — affiliate landing page click handling
 * Responsibilities:
 *   1. Capture Google Ads click identifiers (gclid / gbraid / wbraid) and UTM params from the URL.
 *   2. Persist them for the session so they survive navigation between pages.
 *   3. Rewrite every CTA link (<a class="cta">) to point at the tracker campaign URL,
 *      appending the captured identifiers so the tracker can map a later conversion
 *      back to the Google Ads click (offline conversion import / OCI).
 *   4. Fire a soft "cta_click" gtag event for remarketing / early optimization.
 *
 * Fill these placeholders before going live (see README.md):
 *   - TRACKER_CAMPAIGN_URL : your tracker (RedTrack/BeMob) campaign link, with its clickid macro.
 *   - GTAG_ID is set directly in each HTML <head>.
 */
(function () {
  "use strict";

  var TRACKER_CAMPAIGN_URL = "{{TRACKER_CAMPAIGN_URL}}";

  var TRACK_KEYS = [
    "gclid", "gbraid", "wbraid",
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "keyword", "matchtype", "device", "campaignid", "adgroupid"
  ];

  // --- 1 & 2: capture + persist tracking params -------------------------------
  function readParams() {
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("kosg_tparams") || "{}");
    } catch (e) { stored = {}; }

    var current = new URLSearchParams(window.location.search);
    TRACK_KEYS.forEach(function (k) {
      var v = current.get(k);
      if (v) { stored[k] = v; }
    });

    try { sessionStorage.setItem("kosg_tparams", JSON.stringify(stored)); } catch (e) {}
    return stored;
  }

  // --- 3: build the outbound tracker URL --------------------------------------
  function buildCtaUrl(params) {
    // Not configured yet — keep CTAs inert so we never send users nowhere useful.
    if (!TRACKER_CAMPAIGN_URL || TRACKER_CAMPAIGN_URL.indexOf("{{") === 0) {
      return null;
    }
    var pairs = [];
    Object.keys(params).forEach(function (k) {
      pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
    });
    var qs = pairs.join("&");
    if (!qs) { return TRACKER_CAMPAIGN_URL; }
    return TRACKER_CAMPAIGN_URL + (TRACKER_CAMPAIGN_URL.indexOf("?") > -1 ? "&" : "?") + qs;
  }

  // --- 4: wire up CTAs --------------------------------------------------------
  function wireCtas(url) {
    var ctas = document.querySelectorAll("a.cta");
    Array.prototype.forEach.call(ctas, function (a) {
      if (url) {
        a.setAttribute("href", url);
      }
      // affiliate best practice: do not pass link equity, mark as sponsored.
      a.setAttribute("rel", "sponsored nofollow noopener");
      a.setAttribute("target", "_blank");

      a.addEventListener("click", function () {
        if (typeof window.gtag === "function") {
          window.gtag("event", "cta_click", {
            event_category: "engagement",
            event_label: a.getAttribute("data-cta") || "cta"
          });
        }
      });
    });
  }

  function init() {
    var params = readParams();
    var url = buildCtaUrl(params);
    wireCtas(url);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
