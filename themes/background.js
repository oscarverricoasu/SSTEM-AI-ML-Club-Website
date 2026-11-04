let scene;
export function mount() {
    scene = document.createElement("div");
    scene.className = "mountain-scene";
    scene.setAttribute("aria-hidden", "true");
    document.body.prepend(scene);
}
export function unmount() { scene?.remove(); scene = null; }
