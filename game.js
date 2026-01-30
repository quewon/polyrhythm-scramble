import { spawn_particle, draw_particles, update_particles } from "./particle.js";
import { keydown, keypressed, update_keyboard } from "./keyboard.js";
import { draw_beatmap, update_beatmap } from "./beatmap.js";

const HIT_OFFSET_CAP = .3;
const HIT_PERFECT_DISTANCE = .1;
const COMBO_TEXT_COLOR = "black";

var context = document.querySelector("canvas").getContext("2d");
var grid;
var rhythm_radius;
var beat_radius;

window.addEventListener("resize", resize);

function resize() {
    context.canvas.width = window.innerWidth * window.devicePixelRatio;
    context.canvas.height = window.innerHeight * window.devicePixelRatio;

    grid = Math.min(window.innerWidth, window.innerHeight) / 4;
    rhythm_radius = grid / 2 * 0.9;
    beat_radius = window.devicePixelRatio * 3;
}

function draw() {
    context.resetTransform();
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.translate(context.canvas.width/2, context.canvas.height/2);
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    draw_beatmap(context);
    draw_particles(context);

    requestAnimationFrame(draw);
}

let previousTime = new Date();
function update() {
    let now = new Date();
    let delta = now - previousTime;

    update_beatmap(delta);
    update_particles(delta);
    update_keyboard();

    previousTime = now;
    requestAnimationFrame(update);
}

resize();
draw();
update();

export { context, COMBO_TEXT_COLOR, HIT_OFFSET_CAP, HIT_PERFECT_DISTANCE, grid, rhythm_radius, beat_radius }