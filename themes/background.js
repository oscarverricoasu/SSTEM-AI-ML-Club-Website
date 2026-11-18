let scene;
export async function mount() {
    const currentScene = document.createElement("div");
    scene = currentScene;
    currentScene.className = "mountain-scene";
    currentScene.setAttribute("aria-hidden", "true");
    document.body.prepend(currentScene);
    const asset = document.documentElement.dataset.theme === "matrix"
        ? "../images/matrix-code.gif" : "../images/mountains.svg";
    const image = new Image();
    image.src = new URL(asset, import.meta.url).href;
    try { await image.decode(); } catch { /* Keep the solid background if unavailable. */ }
}
export function unmount() { scene?.remove(); scene = null; }
