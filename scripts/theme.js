(() => {
    "use strict";
    const base = new URL("../", document.currentScript.src);
    const key = "aiml-club-theme";
    const layout = document.documentElement.dataset.layout || "standard";
    const ready = document.readyState === "loading"
        ? new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, { once: true }))
        : Promise.resolve();
    let activeModule;
    let activeLink;
    let request = 0;
    let closeMenu = () => {};
    function savedTheme() {
        try { return localStorage.getItem(key); } catch { return null; }
    }
    function save(id) {
        try { localStorage.setItem(key, id); } catch { /* The picker still works without storage. */ }
    }
    // Give existing page animations the saved preference while the registry loads.
    document.documentElement.dataset.theme = savedTheme() || "original";

    async function start() {
        const response = await fetch(new URL("themes/themes.json", base)); // reads theme from json file
        if (!response.ok) throw new Error(`Theme registry: HTTP ${response.status}`);
        const registry = await response.json();
        const themes = new Map();
        for (const theme of registry.themes) {
            if (!/^[a-z][a-z0-9-]*$/.test(theme.id) || themes.has(theme.id)
                || typeof theme.name !== "string" || typeof theme.stylesheet !== "string"
                || !["standard", "explorer"].includes(theme.layout)
                || (theme.layout !== "standard" && typeof theme.entry !== "string")) {
                throw new Error("Invalid theme registry entry");
            }
            themes.set(theme.id, theme);
        }
        const fallback = themes.get(registry.defaultTheme);
        if (!fallback || fallback.layout !== "standard") throw new Error("Invalid default theme");
        await ready;
        const status = document.createElement("span");
        status.className = "theme-status";
        status.setAttribute("role", "status");
        document.body.append(status);

        async function apply(id, persist = false) {
            const currentRequest = ++request;
            const theme = themes.get(id) || fallback;
            const entry = new URL(theme.entry || "index.html", base);
            if (theme.layout !== layout) {
                // Explorer is a separate page; retain the last standard skin.
                if (persist && theme.layout === "standard") save(theme.id);
                location.assign(entry.href);
                return;
            }
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.media = "not all";
            link.href = new URL(theme.stylesheet, base).href;
            try {
                const loaded = new Promise((resolve, reject) => {
                    link.onload = resolve;
                    link.onerror = () => reject(new Error(`Could not load ${theme.name}`));
                });
                document.head.append(link);
                const [, module] = await Promise.all([
                    loaded,
                    theme.module ? import(new URL(theme.module, base).href) : undefined
                ]);
                if (currentRequest !== request) { link.remove(); return; }
                activeModule?.unmount();
                activeModule = undefined;
                document.documentElement.dataset.theme = theme.id;
                link.media = "all";
                activeLink?.remove();
                activeLink = link;
                activeModule = module;
                module?.mount();
                if (persist && theme.layout === "standard") save(theme.id);
                document.querySelectorAll("[data-theme-option]").forEach(option => {
                    option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme.id));
                });
                status.textContent = "";
                document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme.id } }));
            } catch (error) {
                link.remove();
                if (currentRequest === request) status.textContent = "Theme could not load. Please try again.";
                console.warn(error);
            }
        }

        document.querySelectorAll(".theme-control").forEach(control => {
            const toggle = control.querySelector(".theme-toggle");
            const options = control.querySelector(".theme-options");
            if (!toggle || !options) return;
            const close = (focus = false) => {
                options.hidden = true;
                toggle.setAttribute("aria-expanded", "false");
                if (focus) toggle.focus();
            };
            closeMenu = close;
            for (const theme of themes.values()) {
                const button = document.createElement("button");
                button.type = "button";
                button.dataset.themeOption = theme.id;
                button.textContent = theme.name;
                button.setAttribute("aria-pressed", "false");
                button.addEventListener("click", () => { void apply(theme.id, true); close(true); });
                options.append(button);
            }
            toggle.addEventListener("click", () => {
                options.hidden = !options.hidden;
                toggle.setAttribute("aria-expanded", String(!options.hidden));
            });
            document.addEventListener("click", event => { if (!control.contains(event.target)) close(); });
            control.addEventListener("keydown", event => {
                if (event.key === "Escape" && !options.hidden) { event.preventDefault(); close(true); }
            });
            control.addEventListener("focusout", event => {
                if (!control.contains(event.relatedTarget)) close();
            });
        });
        const previousTheme = () => {
            const saved = themes.get(savedTheme());
            return saved?.layout === "standard" ? saved.id : fallback.id;
        };
        document.querySelectorAll("[data-return-theme]").forEach(button => {
            button.addEventListener("click", () => { void apply(previousTheme(), true); });
        });
        // Direct visits to Explorer keep the saved standard theme intact.
        const initial = layout === "standard" ? previousTheme()
            : [...themes.values()].find(theme => theme.layout === layout)?.id;
        await apply(initial);
        window.addEventListener("storage", event => {
            if (layout === "standard" && (event.key === key || event.key === null)) {
                closeMenu(); void apply(previousTheme());
            }
        });
    }
    start().catch(async error => {
        console.warn("Themes unavailable:", error);
        await ready;
        document.documentElement.dataset.theme = layout === "standard" ? "original" : "file-explorer";
        document.dispatchEvent(new Event("themechange"));
        document.querySelectorAll(".theme-toggle").forEach(button => {
            button.disabled = true;
            button.textContent = "Themes unavailable";
        });
    });
})();
