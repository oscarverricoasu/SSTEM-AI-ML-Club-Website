let desktop;
export function mount() {
        desktop = document.createElement("div");
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
}
export function unmount() { desktop?.remove(); desktop = null; }
