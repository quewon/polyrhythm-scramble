import { spawn_particle, draw_particles, update_particles } from "./particle.js";
import { keydown, keypressed, update_keyboard } from "./keyboard.js";
import { draw_beatmap, update_beatmap } from "./beatmap.js";

var context = document.querySelector("canvas").getContext("2d");
var aspect = 3/4;
var width;
var height;
var grid;
var rhythm_radius;
var beat_radius;

window.addEventListener("resize", resize);

function resize() {
    context.canvas.width = window.innerWidth * window.devicePixelRatio;
    context.canvas.height = window.innerHeight * window.devicePixelRatio;

    width = Math.min(500, window.innerWidth);
    height = Math.min(500, window.innerHeight);
    if (width / aspect > height) {
        width = height * aspect;
    } else {
        height = width / aspect;
    }

    grid = width / 2;
    rhythm_radius = grid / 2 * 0.9;
    beat_radius = Math.max(window.devicePixelRatio * 3, grid / 30);
}

function draw() {
    context.resetTransform();
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.translate(context.canvas.width/2, context.canvas.height/2);
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    // context.strokeStyle = "lightgray";
    // context.lineWidth = 1;
    // context.strokeRect(-width/2, -height/2, width, height);

    draw_beatmap(context);
    draw_particles(context);
}
function update(delta, now) {
    update_beatmap(delta, now);
    update_particles(delta);
    update_keyboard();
    draw();
}

resize();

if (typeof performance === "function") {
    let previousTime = performance.now();
    function performance_update() {
        let now = performance.now();
        let delta = now - previousTime;
        update(delta, now);
        previousTime = now;
        requestAnimationFrame(performance_update);
    }
    performance_update();
} else {
    let previousTime = new Date();
    function normal_update() {
        let now = new Date().getTime();
        let delta = now - previousTime;
        update(delta, now);
        previousTime = now;
        requestAnimationFrame(normal_update);
    }
    normal_update();
}

export { grid, rhythm_radius, beat_radius }