/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const $ = document.getElementById.bind(document);
const logError = console.exception.bind(console);

const getStorage = async () => {
    try {
        const { syncSettings } = await browser.storage.local.get({ syncSettings: true });
        return browser.storage[syncSettings ? "sync" : "local"];
    } catch (e) {
        return browser.storage.sync;
    }
};

const saveOptions = async () => {
    const domains = $("domains").value.split(/\s*,\s*/).filter(v => !!v);
    $("domains").value = domains.join(", ");

    const mode = $("mode").value;

    const storage = await getStorage();
    try {
        await storage.set({ domains, mode });
        console.info("Settings saved", { domains, mode });
        $("status").textContent = "Settings saved!";
        setTimeout(() => { $("status").textContent = ""; }, 750);
    } catch (e) {
        logError(e);
    }
};

const restoreOptions = async () => {
    const storage = await getStorage();
    try {
        const { domains, mode, syncSettings } = await storage.get({ domains: [], mode: "whitelist", syncSettings: true });
        $("domains").value = domains.filter(v => !!v).join(", ");
        $("mode").value = mode;
        $("syncsettings").checked = syncSettings;
    } catch (e) {
        logError(e);
    }
};

const onSyncSettingsChanged = async () => {
    await browser.storage.local.set({ syncSettings: $("syncsettings").checked });
    await restoreOptions();
}

document.addEventListener("DOMContentLoaded", restoreOptions);

$("save").addEventListener("click", saveOptions);
$("syncsettings").addEventListener("change", onSyncSettingsChanged);
