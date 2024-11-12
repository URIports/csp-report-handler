# JavaScript CSP Report Handler

## Overview

This project provides a JavaScript utility for capturing and reporting Content Security Policy (CSP) violations. The script listens for `securitypolicyviolation` events and sends the details of each violation to URIports for further analysis.

## Prerequisites

A URIports account is required to use this script effectively. To create an account, visit https://www.uriports.com to start your 30-day trial.


## Files

- **uriports-csp-report-handler.js**: The JavaScript file responsible for handling CSP violations and sending reports to URIports.
- **uriports-csp-report-handler.min.js**: The minified version, optimized for performance and reduced size.

## How It Works

1. **Configuration**: The script reads a configuration block from an HTML element with the ID `uriports-csp-report-config`. This JSON configuration defines parameters such as:

   - `subdomain`: The subdomain of your URIports account for CSP reporting.
   - `fraction`: The fraction of violations to report (useful for sampling).
   - `ignorePatterns`: A list of patterns to ignore in CSP violation reports, useful for excluding known, non-critical violations.

2. **Event Listener**: The script adds an event listener for the `securitypolicyviolation` event, which is triggered by the browser whenever a CSP violation occurs.

3. **Violation Filtering**: The script filters violations based on several criteria:

   - **Sampling (fraction)**: Only reports a fraction of violations as defined by the `fraction` parameter.
   - **Browser Extensions**: Violations from browser extensions (e.g., `moz-extension://` or `chrome-extension://`) are ignored.
   - **Ignore Patterns**: Violations involving URIs or sources that match any user-defined pattern are skipped.

4. **Violation Deduplication**: The script tracks reported violations using a hash to avoid duplicate reporting.

5. **Reporting**: If the violation passes all filters, the script sends the report as a JSON payload to the configured subdomain using a `POST` request.

## Usage

### Adding the Configuration to Your HTML

Save your configuration as a JSON in your HTML file:

```html
<script type="application/json" id="uriports-csp-report-config">
  {
    "subdomain": "your-subdomain-here",
    "fraction": 1,
    "ignorePatterns": ["example.com", "analytics.js"]
  }
</script>
```

### Including the JavaScript File

Include the javascript file in your HTML:

```html
<script src="/path/to/uriports-csp-report-handler.min.js"></script>
```
Replace `/path/to/` with the actual path to the JavaScript file.

## Configuration Parameters

- **`subdomain`**: The subdomain of your URIports account to which CSP reports are sent. You can find your subdomain in the [settings of your URIports account](https://app.uriports.com/settings/).
- **`fraction`**: The proportion of violations to report, expressed as a value between `0` and `1`. A value of `1` means all violations are reported. A fraction of `0.1` means that 10% of violations are reported. If the fraction is set to `0.01`, it means that 1% of violations are reported.
- **`ignorePatterns`**: An array of strings representing patterns to ignore. If any blocked URI, source file, or document URI matches a pattern, the violation is not reported.

## Adding a Hash or Nonce to the script

To enhance security, it is recommended to add a `nonce` or `hash` to your script. This ensures only authorized scripts are executed.

Read more about nonces and hashes in our dedicated CSP blog: [Creating a Content Security Policy (CSP)](https://www.uriports.com/blog/creating-a-content-security-policy-csp/)

## Example HTML File

Check out the [demo.html](demo.html) file for an example.

## CSP Header Configuration

When you use this script and also use CSP in the headers of your site, you must whitelist `*.uriports.com` or `your-subdomain-here.uriports.com` in the `connect-src` directive so the script can communicate with URIports. Also ensure that your CSP policy permits the execution of this script by using nonces, hashes or 'self'.

Example CSP header:

```
Content-Security-Policy: connect-src 'self' https://*.uriports.com;
```

Alternatively, to whitelist only a specific subdomain:

```
Content-Security-Policy: connect-src 'self' https://your-subdomain-here.uriports.com;
```

## Browser Compatibility

The `securitypolicyviolation` event is supported by most modern browsers. For the latest compatibility details, visit: https://caniuse.com/?search=securitypolicyviolation

## License

This project is licensed under the MIT License.

Copyright (c) 2024 URIports B.V. https://www.uriports.com

## Contributing

Feel free to open issues or submit pull requests for improvements, bug fixes, or additional features.
