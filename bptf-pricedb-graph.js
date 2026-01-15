// ==UserScript==
// @name         backpack.tf pricedb graph
// @version      1.0.0
// @description  adds a pricedb.io graph to item pages on bptf
// @author       purplebarber
// @match        https://backpack.tf/stats/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    function isFestivized(title, originalTitle) {
        return (title + originalTitle).toLowerCase().includes("festivized");
    }

    function buildSku(dataSet, item) {
        const parts = [];

        const priceIndex = dataSet.priceindex || "0";
        const [out, outQ, baseTarget] = priceIndex.split("-");
        let target = baseTarget;

        const base = dataSet.baseName;
        if (base === "Kit") target = outQ;
        if (base === "Strangifier" || base === "Unusualifier") target = out;

        parts.push(dataSet.defindex);
        parts.push(dataSet.quality);

        if (dataSet.effect_id > 0) parts.push(`u${dataSet.effect_id}`);
        if (dataSet.australium === "1") parts.push("australium");
        if (dataSet.craftable !== "1") parts.push("uncraftable");
        if (dataSet.quality_elevated === "11" && dataSet.quality !== "11") parts.push("strange");
        if (dataSet.ks_tier > 0) parts.push(`kt-${dataSet.ks_tier}`);
        if (isFestivized(item.title, dataSet.originalTitle)) parts.push("festive");

        if (target) parts.push(`td-${target}`);
        if (out && base === "Fabricator") parts.push(`od-${out}`);
        if (outQ && base === "Fabricator") parts.push(`oq-${outQ}`);
        if (dataSet.crate) parts.push(`c${dataSet.crate}`);

        return parts.filter(Boolean).join(";");
    }

    function insertGraph() {
        if (document.getElementById("pricedb-graph-wrapper")) return;

        const item = document.querySelector(".item[data-defindex]");
        if (!item) return;

        const sku = buildSku(item.dataset, item);
        const wrapper = document.createElement("div");

        wrapper.id = "pricedb-graph-wrapper";
        wrapper.innerHTML = `
            <iframe
                src="https://pricedb.io/api/graph/${sku}"
                style="width: 100%; height: 500px; border: none; background: #1b1b1b; margin: 10px 0; border-radius: 4px; border: 1px solid #222;"
            ></iframe>
        `;

        const header = [...document.querySelectorAll("h2")].find(h => h.innerText.includes("Suggestions"));
        if (header) {
            header.before(wrapper);
        } else {
            document.querySelector(".stats-panel")?.appendChild(wrapper);
        }
    }

    insertGraph();
})();
