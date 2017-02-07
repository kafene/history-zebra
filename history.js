/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

// from <https://github.com/benjamingr/RegExp.escape>
const regexEscape = (str) => String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');

const logError = (err) => { console.exception(err); };

const getUrlDomain = (url) => {
    const a = document.createElement("a");
    a.href = url;
    return a.hostname;
};

const clearHistory = () => {
    let whitelistRegex;

    browser.storage.local.get({ whitelist: "" }).then(({ whitelist }) => {
        // one big regex to match any whitelisted domain, or subdomain of that domain.
        whitelistRegex = new RegExp("(^|\\.)(" + whitelist.map(regexEscape).join("|") + ")$", "i");

        return browser.history.search({ text: "", maxResults: Number.MAX_SAFE_INTEGER });
    }).then(results => {
        let numRemoved = 0, numKept = 0;

        for (const result of results) {
            const isWhitelisted = whitelistRegex.test(getUrlDomain(result.url));

            if (isWhitelisted) {
                numKept += 1;
            } else {
                numRemoved += 1;
                browser.history.deleteUrl({ url: result.url });
            }
        }

        browser.notifications.create("history-whitelist", {
            type: "basic",
            message: `Removed ${numRemoved} history entries, kept ${numKept}.`,
            title: "History Whitelist",
        });
    }).catch(logError);
};

document.getElementById("clear").addEventListener("click", clearHistory);

document.getElementById("options").addEventListener("click", () => {
    browser.runtime.openOptionsPage();
});
