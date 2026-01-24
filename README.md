# URL Tracker Stripper

Chrome extension that removes tracking parameters from Google URLs for cleaner, more private browsing.

## Purpose

Google adds numerous tracking parameters to URLs (like `?ved=...`, `?ei=...`, `?sxsrf=...`) to track your searches and clicks. 

This extension strips these parameters automatically, giving you:

- Shorter, more readable URLs
- Reduced tracking from Google

**This extension only targets Google by Default.** Support for other sites can be added manually.

## Why Google Only by Default?

The default configuration focuses on Google for these reasons:

1. **Stability** - Applying URL modifications to all sites can break functionality. Some sites use query parameters for essential features (authentication, pagination, session state). Google's tracking params are well-documented and safe to remove.

2. **XHR Safety** - Modifying `xmlhttprequest` calls globally can break video players (YouTube), SPAs, and AJAX-heavy sites. Limiting to Google avoids this.

3. **Biggest offender** - Google adds the most tracking parameters to URLs. A single Google search result can have 10+ tracking params. Cleaning Google URLs gives the highest privacy benefit with lowest risk.

4. **Predictable behavior** - Users know exactly what the extension does. No surprises or broken sites.

You can extend to other sites if you understand the risks

## Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the extension directory

## Adding New Tracking Parameters

Edit `rules.json` and add parameters to the `removeParams` array:

```json
"removeParams": [
  "rlz",
  "ved",
  "your_new_param"
]
```

Reload the extension in `chrome://extensions/` for changes to take effect.

## Adding Support for Other Sites

Edit `rules.json` and add domains to the `requestDomains` array:

```json
"condition": {
  "resourceTypes": ["main_frame", "xmlhttprequest"],
  "requestDomains": ["google.com", "facebook.com"]
}
```

Or create a separate rule with its own `id` for site-specific parameters:

```json
{
  "id": 2,
  "priority": 1,
  "action": {
    "type": "redirect",
    "redirect": {
      "transform": {
        "queryTransform": {
          "removeParams": ["fbclid", "fb_source"]
        }
      }
    }
  },
  "condition": {
    "resourceTypes": ["main_frame"],
    "requestDomains": ["facebook.com"]
  }
}
```

## How It Works

This extension uses Chrome's Declarative Net Request API (Manifest V3) instead of JavaScript-based request interception.

**Why declarative is faster:**

- Rules are defined as static JSON and compiled by Chrome at install time
- Chrome's C++ network stack processes rules directly—no JavaScript execution per request
- No background script needs to wake up, parse URLs, or run logic on every request
- Rules are evaluated in parallel with network operations, not blocking them

Old Manifest V2 extensions ran JavaScript on every request, adding latency and CPU overhead. Declarative rules have near-zero performance impact.

## License

MIT
