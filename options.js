/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const $ = document.getElementById.bind(document);
const logError = (err) => { console.exception(err); };

const saveOptions = () => {
    const whitelist = $("whitelist").value.split(/\s*,\s*/).filter(v => !!v);
    $("whitelist").value = whitelist.join(", ") + ", ";

    browser.storage.local.set({ whitelist }).then(() => {
        $("status").textContent = "Whitelist saved!";
        setTimeout(() => { $("status").textContent = ""; }, 750);
    }).catch(logError);
};

const restoreOptions = () => {
    browser.storage.local.get({ whitelist: "" }).then(({ whitelist }) => {
        document.getElementById("whitelist").value = whitelist.join(", ") + ", ";
    }).catch(logError);
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
