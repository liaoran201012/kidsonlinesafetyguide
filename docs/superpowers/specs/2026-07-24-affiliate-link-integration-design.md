# Affiliate Link Integration Design

## Goal

Connect the Bark offer URL supplied by the site owner to every commercial
conversion control on the landing page without changing internal navigation.

## Scope

The following four controls will open the affiliate destination:

- Header: “Try Bark”
- Hero: “Start a free trial”
- Pricing: “Check current pricing”
- Final call to action: “Start your free trial”

The hero “See how it works” control will remain an internal link to `#how`.
Navigation, footer, policy-page, and 404-page links are unchanged.

## Design

Commercial links will be identified explicitly with a `data-affiliate`
attribute. The outbound-link script will select only anchors with that
attribute instead of relying on the visual `.cta` class.

The supplied affiliate URL will be stored once in `assets/main.js`. The
existing tracking flow will continue to capture supported Google Ads and UTM
parameters from the landing-page URL, persist them for the browser session,
and append them to the affiliate URL. Existing query parameters in the
affiliate URL will be preserved.

Every affiliate link will receive:

- `target="_blank"`
- `rel="sponsored nofollow noopener"`
- The existing `cta_click` analytics event, using its `data-cta` label

## Error Handling

If the configured affiliate URL is empty or still contains a template
placeholder, the script will not replace the HTML fallback URL. Failure to
read or write session storage will remain non-fatal.

## Verification

Automated/static checks will verify:

1. Exactly four anchors are marked as affiliate links.
2. All four resolve to the supplied offer URL after script initialization.
3. Existing offer query parameters remain present.
4. Captured tracking parameters are appended and URL-encoded.
5. “See how it works” remains `href="#how"` and is not marked as affiliate.
6. Affiliate links have the required `rel` and `target` attributes.

## Out of Scope

This change does not alter page copy, styling, offer claims, analytics IDs,
privacy language, deployment settings, or unrelated repository files.
