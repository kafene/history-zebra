/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const $ = document.getElementById.bind(document);
const logError = console.exception.bind(console);

const saveOptions = () => {
    const domains = $("domains").value.split(/\s*,\s*/).filter(v => !!v);
    $("domains").value = domains.join(", ");

    const mode = $("mode").value;

    browser.storage.local.set({ domains, mode }).then(() => {
        console.info("Settings saved", { domains, mode });
        $("status").textContent = "Settings saved!";
        setTimeout(() => { $("status").textContent = ""; }, 750);
    }).catch(logError);
};

const restoreOptions = () => {
    browser.storage.local.get({ domains: [], mode: "whitelist" }).then(({ domains, mode }) => {
        $("domains").value = domains.filter(v => !!v).join(", ");
        $("mode").value = mode;
    }).catch(logError);
};

document.addEventListener("DOMContentLoaded", restoreOptions);

$("save").addEventListener("click", saveOptions);
