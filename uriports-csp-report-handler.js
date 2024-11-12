/*
 * MIT License
 *
 * Copyright (c) 2024 URIports B.V. https://www.uriports.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {

	// The ID of the HTML element containing the CSP report configuration
	const CONFIG_ELEMENT_ID = 'uriports-csp-report-config';

	// Track already reported violations to avoid redundant reports
	const reportedViolations = new Set();

	// Event listener for security policy violations
	document.addEventListener('securitypolicyviolation', function (event) {
		// Retrieve the CSP report configuration element from the DOM
		const configElement = document.getElementById(CONFIG_ELEMENT_ID);

		// If no config element found, exit early
		if (!configElement) return;

		let config;
		try {
			// Parse the configuration JSON from the config element
			config = JSON.parse(configElement.textContent);
		} catch (error) {
			// Log an error if parsing fails
			console.error('Failed to parse CSP report config:', error);
			return;
		}

		// Determine the fraction of violations to report (default to 1 if not specified)
		const fraction = config.fraction ?? 1;

		// Random sampling to reduce the number of reports
		if (Math.random() > fraction) return;

		// Ignore violations originating from browser extensions (moz/chrome extensions)
		if (event.sourceFile && /^((moz|chrome)-extension):\/\//.test(event.sourceFile)) return;

		// Ignore violations based on user-defined patterns in the configuration
		if (config.ignorePatterns && Array.isArray(config.ignorePatterns) &&
			config.ignorePatterns.some(pattern =>
				event.blockedURI?.includes(pattern) ||
				event.sourceFile?.includes(pattern) ||
				event.documentURI?.includes(pattern))) {
			// Skip reporting if any pattern matches the blocked URI, source file, or document URI
			return;
		}

		// Create a unique Base64 encoding hash to track this specific violation
		const violationKey = btoa(`${event.blockedURI || ''}|${event.documentURI || ''}|${event.effectiveDirective || ''}|${event.sourceFile || ''}`);

		// Skip reporting if this violation has already been reported
		if (reportedViolations.has(violationKey)) return;

		// Mark this violation as reported
		reportedViolations.add(violationKey);

		// Check if the subdomain is specified in the configuration
		const subdomain = config.subdomain;

		// If no subdomain is configured, exit early
		if (!subdomain) return;

		// Build the CSP report payload
		const json = {
			'csp-report': {
				'blockedURL'        : event.blockedURI ?? null,
				'columnNumber'      : event.columnNumber ?? null,
				'documentURL'       : event.documentURI ?? null,
				'effectiveDirective': event.effectiveDirective ?? null,
				'lineNumber'        : event.lineNumber ?? null,
				'originalPolicy'    : event.originalPolicy ?? null,
				'sourceFile'        : event.sourceFile ?? null,
				'statusCode'        : event.statusCode ?? null,
				'referrer'          : event.referrer ?? null,
				'sample'            : event.sample ?? null,
				'disposition'       : event.disposition ?? null,
				'fraction'          : fraction ?? null // Add the sampling fraction used, not CSP3 spec, but URIports uses it for calculations
			}
		};

		// Send the CSP report to the configured URIports endpoint
		fetch(`https://${subdomain}.uriports.com/reports/report`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }, // Set the content type to JSON
			body: JSON.stringify(json) // Convert the JSON payload to a string
		}).catch(error => console.error('Failed to send CSP report:', error)); // Log an error if the fetch fails
	});
})();
