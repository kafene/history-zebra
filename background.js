/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const NO_DOMAINS = "<no-domains>";

const MODE = {
    default: "whitelist",
    whitelist: "whitelist",
    blacklist: "blacklist",
};

// These are stored globally so they can change during settings changes
// and will also change within the scope of the history.onVisited listener.
let gDomainsPattern = null;
let gMode = MODE.default;

// Escape a string for a RegExp. From <https://github.com/benjamingr/RegExp.escape>.
const regexEscape = (str) => String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');

const logError = console.exception.bind(console);

const getUrlDomain = (url) => {
    const a = document.createElement("a");
    a.href = url;
    return a.hostname;
};

// Create one big regex to match any domain, or subdomain of that domain.
const generateDomainsPattern = (domains) => {
    let domainsList = Array.isArray(domains) ? domains : [];

    if (domainsList.length === 0) {
        gDomainsPattern = NO_DOMAINS;
    } else {
        domainsList = domainsList.map(regexEscape).join("|");
        gDomainsPattern = new RegExp(`(?:^|\\.)(?:${domainsList})$`, "i");
    }

    console.info(`generated domains pattern: ${gDomainsPattern}`);
};

const setMode = (mode) => {
    gMode = MODE[mode] || MODE.default;

    console.info("set mode", mode);
};

// Update the domains pattern and mode every time their settings are changed.
browser.storage.onChanged.addListener(changes => {
    if ("domains" in changes) {
        generateDomainsPattern(changes.domains.newValue);
    }
    if ("mode" in changes) {
        setMode(changes.mode.newValue);
    }
});

// Startup: fetch the domains and mode settings.
browser.storage.local.get({ domains: [], mode: MODE.default }).then(({ domains, mode }) => {
    generateDomainsPattern(domains);
    setMode(mode);
}).catch(logError);

// Startup: listen for every time something is added to the history.
browser.history.onVisited.addListener(({ url=null }) => {
    // This could potentially run before the Promise to fetch
    // the domains and mode settings has resolved.
    if (gDomainsPattern === null) {
        return;
    }

    // history.HistoryItem.url is optional? <https://mzl.la/2loe2eJ>
    if (!url) {
        return;
    }

    const domain = getUrlDomain(url);
    if (!domain) {
        console.warn(`getUrlDomain(${url}) was ${domain || "blank"}.`);
        return;
    }

    let keep = true;

    // no domains => always keep!
    if (gDomainsPattern !== NO_DOMAINS) {
        switch (gMode) {
            case MODE.blacklist:
                keep = !(gDomainsPattern.test(domain) || gDomainsPattern.test(btoa(domain)));
                break;
            case MODE.whitelist:
            default:
                keep = gDomainsPattern.test(domain);
                break;
        }
    }

    if (keep) {
        console.info(`{history-zebra}: keeping ${url}`);
    } else {
        browser.history.deleteUrl({ url: url }).then(() => {
            console.info(`{history-zebra}: removed ${url}`);
        }).catch(logError);
    }
});
