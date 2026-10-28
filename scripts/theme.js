/* Apply the saved preference before paint; storage may be unavailable in private browsing. */
(() => {
    "use strict";
    const key = "aiml-club-theme";
    function apply(value) {
        const theme = ["appstate", "classic", "luke", "matrix", "FileExplorer"].includes(value) ? value : "original";
        document.documentElement.dataset.theme = theme;
        document.querySelectorAll("[data-theme-option]").forEach(option => {
            option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme));
        });
        document.dispatchEvent(new Event("themechange"));
    }
    let saved = "original";
    try { saved = localStorage.getItem(key); } catch {}
    apply(saved);
    document.addEventListener("DOMContentLoaded", () => {
        const control = document.querySelector(".theme-control");
        const toggle = control?.querySelector(".theme-toggle");
        const options = control?.querySelector(".theme-options");
        if (toggle && options) {
            const close = (restoreFocus = false) => {
                options.hidden = true;
                toggle.setAttribute("aria-expanded", "false");
                if (restoreFocus) toggle.focus();
            };
            apply(document.documentElement.dataset.theme);
            toggle.addEventListener("click", () => {
                options.hidden = !options.hidden;
                toggle.setAttribute("aria-expanded", String(!options.hidden));
            });
            options.querySelectorAll("[data-theme-option]").forEach(option => {
                option.addEventListener("click", () => {
                    apply(option.dataset.themeOption);
                    try { localStorage.setItem(key, option.dataset.themeOption); } catch {}
                    close(true);
                });
            });
            document.addEventListener("click", event => {
                if (!control.contains(event.target)) close();
            });
            control.addEventListener("keydown", event => {
                if (event.key === "Escape" && !options.hidden) {
                    event.preventDefault();
                    close(true);
                }
            });
            control.addEventListener("focusout", event => {
                if (!control.contains(event.relatedTarget)) close();
            });
        }
        // Keep the fixed backdrop behind every section, outside splash stacking contexts.
        const host = document.body;
        const scene = document.createElement("div");
        scene.className = "mountain-scene";
        scene.setAttribute("aria-hidden", "true");
        host.prepend(scene);

        // Decorative windows live inside the page; no real browser popups.
        const desktop = document.createElement("div");
        desktop.className = "classic-desktop";
        desktop.innerHTML = `
            <div class="classic-popups">
                <aside class="classic-window" aria-labelledby="classic-welcome-title">
                    <div class="classic-titlebar"><span id="classic-welcome-title">welcome.exe</span><button type="button" data-close-popup aria-label="Close welcome window">×</button></div>
                    <div class="classic-window-body"><strong>You've got potential!</strong><p>Welcome to the AI/ML Club.<br>Human curiosity. Unlimited bandwidth.</p><button type="button" data-close-popup>Cool, I'm in!</button></div>
                </aside>
                <aside class="classic-window" aria-labelledby="classic-status-title">
                    <div class="classic-titlebar"><span id="classic-status-title">neural_network.txt</span><button type="button" data-close-popup aria-label="Close neural network window">×</button></div>
                    <div class="classic-window-body"><strong>Brain connection established.</strong><p>Loading next big idea…</p><div class="classic-progress" aria-hidden="true"><span></span></div><p class="classic-small">100% curious. 0% dial-up required.</p><button type="button" data-close-popup>OK</button></div>
                </aside>
            </div>
            <div class="classic-taskbar"><span>AI/ML ONLINE</span><button type="button" class="classic-reopen">Show popups</button><span class="classic-small">Best viewed with curiosity</span></div>`;
        document.body.append(desktop);
        const reopen = desktop.querySelector(".classic-reopen");
        desktop.querySelectorAll("[data-close-popup]").forEach(button => {
            button.addEventListener("click", () => {
                button.closest(".classic-window").hidden = true;
                reopen.focus();
            });
        });
        reopen.addEventListener("click", () => {
            desktop.querySelectorAll(".classic-window").forEach(popup => { popup.hidden = false; });
            desktop.querySelector("[data-close-popup]").focus();
        });
        desktop.addEventListener("keydown", event => {
            if (event.key === "Escape" && event.target.closest(".classic-window")) {
                event.target.closest(".classic-window").hidden = true;
                reopen.focus();
            }
        });
    });
    window.addEventListener("storage", event => {
        if (event.key === key || event.key === null) apply(event.newValue);
    });
})();
