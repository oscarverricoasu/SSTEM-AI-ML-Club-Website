/*
 * Animated iridescent water. No images, libraries, or build step required.
 * Use: <canvas class="wave-background" aria-hidden="true"></canvas>
 * Then: <script src="waves.js" defer></script>
 */
(() => {
    "use strict";

    // Adjust these to change the background.
    const water = {
        speed: 1.0,       // Larger = faster flow down and to the right.
        turbulence: 1.0, // Shape changes: 0 = gliding, 1 = lively, 2 = stronger.
        ripples: 6.0,     // Number of broad ripples across the screen height.
        brightness: 0.95,
        pixelRatio: 1.25  // Resolution cap to keep the animation lightweight.
    };

    const vertexSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentSource = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        varying vec2 v_uv;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_ripples;
        uniform float u_turbulence;
        uniform float u_brightness;

        void main() {
            // Coordinates start at the top left. Subtracting time makes the
            // surface travel toward positive x/y: down and to the right.
            vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
            vec2 p = vec2(uv.x * u_resolution.x / u_resolution.y, uv.y);
            p -= vec2(0.045, 0.035) * u_time;

            // Independent crosscurrents stretch and compress the surface.
            // Different frequencies keep the motion from feeling synchronized.
            float t = u_time * u_turbulence;
            vec2 drift = vec2(
                sin(p.y * 7.0 + p.x * 2.3 + t * 0.63),
                cos(p.x * 5.0 - p.y * 3.1 - t * 0.81)
            );
            p += drift * vec2(0.024, 0.016) * u_turbulence;

            // The large swells and smaller ripples evolve at separate speeds.
            float bend = 0.065 * sin(p.x * 3.1 - p.y * 2.7 + t * 0.43)
                       + 0.030 * sin(p.x * 9.2 + p.y * 4.0 - t * 0.71)
                       + 0.010 * sin(p.x * 17.0 - p.y * 6.0 + t * 1.09);
            float phase = (p.y + p.x * 0.24 + bend) * 6.2831853 * u_ripples;
            float swell = 0.5 + 0.5 * sin(phase);
            float shoulder = pow(swell, 3.0);
            float crest = pow(swell, 6.0 + 10.0 * (0.5 + 0.5 * sin(p.x * 4.0 + p.y * 7.0 - t * 0.57)));
            float glint = pow(swell, 55.0);

            vec3 deep = vec3(0.16, 0.075, 0.46);
            vec3 blue = vec3(0.24, 0.29, 0.94);
            vec3 color = mix(deep, blue, 0.5 + 0.5 * sin(phase - 0.95));
            float light = 0.75 + 0.25 * sin(p.x * 2.4 - p.y * 3.0 + 0.7 + t * 0.31);
            color = mix(color, vec3(0.51, 0.27, 0.98), shoulder * 0.55);

            float cool = smoothstep(0.05, 0.95, uv.x + 0.10 * sin(p.y * 4.0 + t * 0.23));
            vec3 reflected = mix(vec3(1.0, 0.38, 0.49), vec3(0.64, 0.69, 1.0), cool);
            color = mix(color, reflected, crest * light * 0.78);
            color += reflected * shoulder * 0.12 + glint * 0.035;
            color = mix(color, vec3(0.26, 0.55, 0.97),
                        0.30 * (1.0 - uv.y) * uv.x);

            // Gentle falloff keeps the lettering legible without a visible box.
            vec2 centered = (uv - 0.5) * vec2(1.0, 1.5);
            float centerShade = 1.0 - 0.19 * exp(-dot(centered, centered) * 7.0);
            float edgeShade = 1.0 - 0.14 * dot(uv - 0.5, uv - 0.5);
            color *= centerShade * edgeShade * u_brightness;
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const style = document.createElement("style");
    style.textContent = `
        .wave-background {
            position: absolute; inset: 0; width: 100%; height: 100%;
            z-index: 0; pointer-events: none;
            background: linear-gradient(155deg, #694dea, #3435b6 45%, #42237c);
        }
    `;
    document.head.append(style);

    document.querySelectorAll("canvas.wave-background").forEach(canvas => {
        const gl = canvas.getContext("webgl", {
            alpha: false, antialias: false, depth: false, stencil: false,
            powerPreference: "low-power"
        });
        // The CSS gradient remains visible if WebGL is unavailable.
        if (!gl) return;

        function compile(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const message = gl.getShaderInfoLog(shader);
                gl.deleteShader(shader);
                throw new Error(message);
            }
            return shader;
        }

        let program;
        try {
            program = gl.createProgram();
            const vertex = compile(gl.VERTEX_SHADER, vertexSource);
            const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
            gl.attachShader(program, vertex);
            gl.attachShader(program, fragment);
            gl.linkProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(program));
            }
        } catch (error) {
            console.warn("Water background could not start:", error);
            if (program) gl.deleteProgram(program);
            return;
        }

        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        const resolution = gl.getUniformLocation(program, "u_resolution");
        const time = gl.getUniformLocation(program, "u_time");
        gl.uniform1f(gl.getUniformLocation(program, "u_ripples"), water.ripples);
        gl.uniform1f(gl.getUniformLocation(program, "u_turbulence"), water.turbulence);
        gl.uniform1f(gl.getUniformLocation(program, "u_brightness"), water.brightness);

        let elapsed = 0;
        let previous = 0;
        let frame = 0;
        const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

        function draw() {
            gl.uniform1f(time, elapsed * water.speed);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        function resize() {
            const bounds = canvas.getBoundingClientRect();
            const ratio = Math.min(devicePixelRatio || 1, water.pixelRatio);
            canvas.width = Math.max(1, Math.round(bounds.width * ratio));
            canvas.height = Math.max(1, Math.round(bounds.height * ratio));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(resolution, canvas.width, canvas.height);
            draw();
        }

        function animate(now) {
            if (previous) elapsed += Math.min((now - previous) / 1000, 0.05);
            previous = now;
            draw();
            frame = requestAnimationFrame(animate);
        }

        function updatePlayback() {
            cancelAnimationFrame(frame);
            previous = 0;
            if (!document.hidden && !reducedMotion.matches) {
                frame = requestAnimationFrame(animate);
            } else {
                draw();
            }
        }

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        document.addEventListener("visibilitychange", updatePlayback);
        reducedMotion.addEventListener("change", updatePlayback);
        canvas.addEventListener("webglcontextlost", () => {
            cancelAnimationFrame(frame);
        });
        resize();
        updatePlayback();
    });
})();
