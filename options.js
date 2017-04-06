/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const $ = document.getElementById.bind(document);
const logError = console.exception.bind(console);

const saveOptions = async () => {
    const domains = $("domains").value.split(/\s*,\s*/).filter(v => !!v);
    $("domains").value = domains.join(", ");

    const mode = $("mode").value;

    try {
        await browser.storage.local.set({ domains, mode });
        console.info("Settings saved", { domains, mode });
        $("status").textContent = "Settings saved!";
        setTimeout(() => { $("status").textContent = ""; }, 750);
    } catch (e) {
        logError(e);
    }
};

const restoreOptions = async () => {
    try {
        const { domains, mode } = await browser.storage.local.get({ domains: [], mode: "whitelist" });
        $("domains").value = domains.filter(v => !!v).join(", ");
        $("mode").value = mode;
    } catch (e) {
        logError(e);
    }
};

document.addEventListener("DOMContentLoaded", restoreOptions);

$("save").addEventListener("click", saveOptions);
