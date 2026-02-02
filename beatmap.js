import { particles_count, spawn_particle } from "./particle.js";
import { keydown, keypressed } from "./keyboard.js";
import audioContext from "./audioContext.js";
import AudioSprite from "./AudioSprite.js";
import ImageSprite from "./ImageSprite.js";
import { grid, rhythm_radius, beat_radius } from "./game.js";

const HIT_DISTANCE = 100;
const TITLE_FONT_SCALE = 1 / 8;
const INFO_FONT_SCALE = 1 / 12;
const KEY_FONT_SCALE = 1 / 10;
const COMBO_TEXT_COLOR = "lightgray";
const COMBO_FONT_SCALE = 4;
const MISS_PARTICLE_SCALE = 0.7;
const UI_FONT = "'Arial Narrow', 'Babel Sans', sans-serif";

var soundpacks = [
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/cheer/1.wav" }),
            new AudioSprite({ src: "res/packs/doubles/cheer/2.wav" })
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/doubles/cheer/countdown/4.wav" }),
            new AudioSprite({ src: "res/packs/doubles/cheer/countdown/3.wav" }),
            new AudioSprite({ src: "res/packs/doubles/cheer/countdown/2.wav" }),
            new AudioSprite({ src: "res/packs/doubles/cheer/countdown/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/cheer/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/cheer/countin.wav" }),
    },
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2.wav" })
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/4.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/3.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/2.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/glass/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/glass/countin.wav" }),
    }
]
var sprites = {
    hitImage: new ImageSprite({ src: "res/images/perfect.png" }),
    missImage: new ImageSprite({ src: "res/images/miss.png" })
}
var beatmap;
var clears = 0;

function generate_beatmap() {
    let respack = soundpacks[soundpacks.length * Math.random() | 0];
    let bpm;
    let pick;
    let keys;

    if (clears === 0) {
        bpm = 80;
    } else if (clears < 4) {
        bpm = 60 + Math.round(Math.random() * 40);
    } else if (clears < 6) {
        bpm = 60 + Math.round(Math.random() * 60);
    } else if (clears < 8) {
        bpm = 80 + Math.round(Math.random() * 60);
    } else if (clears < 10) {
        bpm = 80 + Math.round(Math.random() * 80);
    } else {
        bpm = 100 + Math.round(Math.random() * 80);
    }

    if (clears < 1) {
        pick = [1, 2];
    } else if (clears < 3) {
        pick = [1, 2, 3, 4];
    } else if (clears < 5) {
        pick = [1, 2, 3, 4, 5, 6, 8];
    } else {
        pick = [2, 3, 4, 5, 6, 7, 8];
    }
    
    if (clears < 4) {
        keys = 2;
    } else if (clears < 8) {
        keys = 2 + Math.ceil(Math.random() * 1);
    } else {
        keys = 2 + Math.ceil(Math.random() * 2);
    }

    let measure = 60 / bpm * 4000;

    function random_subdivisions() {
        let subdivisions = pick.splice(Math.random() * pick.length | 0, 1)[0];
        let a = [];
        a[Math.random() * subdivisions | 0] = 1;
        for (let i=0; i<subdivisions; i++) {
            if (a[i]) continue;
            if (clears > 2) {
                a[i] = Math.random() * 2 | 0;
            } else {
                a[i] = 1;
            }
        }
        return a;
    }

    beatmap = {
        bpm: bpm,
        spawnTime: 1200,
        respack: respack,
        rhythms: [
            {
                spawnTime: measure,
                subdivisions: random_subdivisions(),
                position: [-0.5, 0],
                color: "blue",
            },
            {
                spawnTime: measure * 3 + (measure / 4) * Math.floor(Math.random() * 4),
                subdivisions: random_subdivisions(),
                position: [0.5, 0],
                color: "red",
            },
        ],
    }
}

function start_beatmap(now) {
    beatmap.measure = 60 / beatmap.bpm * 4000;
    beatmap.spawnLeadup = beatmap.measure;
    beatmap.startTime = now;
    beatmap.localElapsed = 0;
    beatmap.adjustedElapsed = 0;
    beatmap.elapsed = 0;
    beatmap.maxCombo = 0;
    beatmap.totalMisses = 0;
    beatmap.combo = 0;
    beatmap.roundCombo = 0;
    beatmap.spareMeasures = 4;
    for (let rhythm of beatmap.rhythms) {
        rhythm.combo = 0;
        rhythm.roundCombo = 0;
        if (!rhythm.subdivisions.includes(1)) {
            rhythm.keyCode = "";
        }
    }
}

function clear_beatmap() {
    if (beatmap.combo > beatmap.maxCombo)
        beatmap.maxCombo = beatmap.combo;
    beatmap.done = true;
    clears++;
    if (beatmap.spareMeasures <= 0) {
        clears = 0;
        beatmap.score = 0;
    } else {
        let product = 1;
        // only works for 2 rhythms
        for (let rhythm of beatmap.rhythms) {
            let prime = rhythm.subdivisions.length;
            while (prime !== 2 && prime % 2 === 0) prime /= 2;
            while (prime !== 3 && prime % 3 === 0) prime /= 2;
            while (prime !== 5 && prime % 5 === 0) prime /= 2;
            while (prime !== 7 && prime % 7 === 0) prime /= 2;
            product *= prime;
        }
        beatmap.score = (Math.ceil(beatmap.bpm / 10) * product) * (beatmap.spareMeasures * 4 + beatmap.maxCombo - beatmap.totalMisses);
    }
    if (!localStorage.getItem("top-clears") || clears > parseInt(localStorage.getItem("top-clears"))) {
        localStorage.setItem("top-clears", clears);
    }
}

function abc_blocks(context, text, size, cx, cy, t, noStroke) {
    let fonts = ["'Times New Roman', serif", "'Arial', 'Helvetica', sans-serif", "'Courier', monospace", UI_FONT, "'Papyrus', 'Comic Sans MS'"];
    let styles = ["", "italic ", "bold "];

    t = t || 0;

    for (let i=0; i<text.length; i++) {
        t++;

        let char = text[i];
        if (char === " ") continue;

        context.save();
        context.translate(
            cx + ((i + 0.5) - text.length/2) * size,
            cy
        );

        switch (t % 2) {
            case 0:
                char = char.toLowerCase();
                break;
            case 1:
                char = char.toUpperCase();
                break;
        }
        let random_font = fonts[t % fonts.length];
        let random_style = styles[t % styles.length];
        context.font = random_style + size + "px " + random_font;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.lineWidth = 4;
        if (!noStroke) {
            context.strokeStyle = "white";
            context.strokeText(char, 0, 0);
        }
        context.fillText(char, 0, 0);

        context.restore();
    }
}

function draw_intro(context) {
    context.fillStyle = "black";
    abc_blocks(context, "polyrhythm", grid * TITLE_FONT_SCALE, 0, -grid/2);
    abc_blocks(context, "scramble", grid * TITLE_FONT_SCALE, 0, -grid/3, 3);

    context.font = (grid * INFO_FONT_SCALE) + "px " + UI_FONT;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("[ANY KEY] TO BEGIN", 0, 0);

    context.textBaseline = "bottom";
    context.fillText("HIGHEST CLEARED : " + localStorage.getItem("top-clears"), 0, grid);
}

function draw_score(context, now) {
    let time = now - (beatmap.elapsed + beatmap.startTime);
    time = Math.min(1000, time);
    let t = time / 1000;

    if (beatmap.spareMeasures <= 0) {
        sprites.missImage.draw(context, grid / 2 * t, 0, grid, grid);
    } else if (clears !== 10) {
        sprites.hitImage.draw(context, grid / 2 * t, 0, grid, grid);
    }

    context.fillStyle = "black";

    context.font = (grid * INFO_FONT_SCALE) + "px " + UI_FONT;
    context.textAlign = "center";
    context.textBaseline = "top";
    if (clears === 10) {
        context.fillText("YOU WIN", 0, -grid);
    } else if (beatmap.spareMeasures <= 0) {
        context.fillText("GAME OVER", 0, -grid);
    } else {
        context.fillText(clears + " ROUND(S) CLEARED", 0, -grid);
    }
    
    context.textBaseline = "middle";
    let x = clears === 10 ? 0 : -grid / 2 * t;
    let lines = [
        beatmap.bpm + " BPM",
        beatmap.rhythms[0].subdivisions.length + ":" + beatmap.rhythms[1].subdivisions.length,
        "x" + beatmap.maxCombo + " COMBO",
        beatmap.totalMisses + " MISS(ES)",
        beatmap.spareMeasures + " SPARE MEASURES",
        beatmap.score + " POINTS"
    ]

    let width = 0;
    let padding = grid / 16;
    let lineheight = grid * INFO_FONT_SCALE * 1.5;
    let height = lineheight * lines.length;
    for (let i=0; i<lines.length; i++) {
        let mm = context.measureText(lines[i]);
        if (mm.width > width) width = mm.width;
    }
    context.save();
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.beginPath();
    context.rect(x - width/2 - padding, -height/2 - padding, width + padding * 2, height + padding * 2);
    context.fill();
    context.stroke();
    context.restore();
    for (let i=0; i<lines.length; i++) {
        context.fillText(lines[i], x, -height/2 + lineheight * (i + 0.5));
    }

    context.textBaseline = "bottom";
    if (clears === 10) {
        context.fillText("[ANY KEY] TO KEEP GOING", 0, grid);
    } else if (beatmap.spareMeasures <= 0) {
        context.fillText("[ANY KEY] TO RESTART", 0, grid);
    } else {
        context.fillText("[ANY KEY] TO CONTINUE", 0, grid);
    }
}

function draw_rhythm_shape(context, rhythm, rx, ry) {
    if (rhythm.subdivisions.length === 1) {
        context.beginPath();
        context.arc(rx, ry, rhythm_radius, 0, Math.PI * 2);
        return;
    }

    context.beginPath();
    for (let i=0; i<rhythm.subdivisions.length; i++) {
        let angle = (i * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
        let x = rx + rhythm_radius * Math.cos(angle);
        let y = ry + rhythm_radius * Math.sin(angle);
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }
    context.closePath();
}

function playhead_position(rhythm) {
    return (beatmap.adjustedElapsed - rhythm.spawnTime) % beatmap.measure;
}

function beat_length(rhythm) {
    if (rhythm.subdivisions.length === 4) {
        return 60 / beatmap.bpm * 1000;
    }
    return 60 / beatmap.bpm * 4000 / rhythm.subdivisions.length;
}

function rhythm_context_save(context, rhythm) {
    if (beatmap.adjustedElapsed < rhythm.spawnTime - beatmap.spawnLeadup) return false;
    context.save();
    if (beatmap.adjustedElapsed < rhythm.spawnTime) {
        context.globalAlpha = 1 - (rhythm.spawnTime - beatmap.adjustedElapsed) / beatmap.spawnLeadup;
    }
    context.translate(rhythm.position[0] * grid, rhythm.position[1] * grid);
    return true;
}

function draw_circles(context) {
    for (let rhythm of beatmap.rhythms) {
        if (!rhythm_context_save(context, rhythm))
            continue;

        context.lineWidth = 2;

        context.strokeStyle = "black";
        context.beginPath();
        context.arc(0, 0, rhythm_radius, rhythm_radius, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = "white";
        context.fill();

        context.restore();
    }
}

function draw_key_text(context, rhythm) {
    if (!rhythm_context_save(context, rhythm)) return;

    let keyText = rhythm.keyCode;
    if (!keyText) {
        for (let compare of beatmap.rhythms) {
            if (!('keyCode' in compare)) {
                if (compare === rhythm)
                    keyText = "[ANY KEY]";
                break;
            }
        }
    } else {
        keyText = keyText.replaceAll("Key", "");
        keyText = keyText.replaceAll("Digit", "");
        keyText = keyText.replaceAll("Control", "Ctrl");
    }
    
    if (keyText) {
        context.fillStyle = rhythm.color;
        if (keyText === "[ANY KEY]") {
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = (grid * KEY_FONT_SCALE) + "px " + UI_FONT;
            context.strokeStyle = "white";
            context.strokeText(keyText, 0, 0);
            context.fillText(keyText, 0, 0);
        } else {
            abc_blocks(context, keyText, grid * KEY_FONT_SCALE, 0, 0, rhythm.subdivisions.length + rhythm.combo);
        }
    }

    context.restore();
}

function draw_rhythm(context, rhythm) {
    if (!rhythm_context_save(context, rhythm)) return;

    let dot_alpha = Math.max(Math.min(1 - (rhythm.spawnTime - beatmap.adjustedElapsed) / beat_length(rhythm), 1), 0);

    context.lineWidth = 2;

    for (
        let i = 0; 
        i < (
            beatmap.adjustedElapsed < rhythm.spawnTime
            ? rhythm.subdivisions.length - Math.floor((rhythm.spawnTime - beatmap.adjustedElapsed) / beat_length(rhythm))
            : rhythm.subdivisions.length
        );
        i++
    ) {
        let angle = (i * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
        let x = rhythm_radius * Math.cos(angle);
        let y = rhythm_radius * Math.sin(angle);
        
        context.beginPath();
        context.arc(x, y, beat_radius, 0, Math.PI * 2);

        switch (rhythm.subdivisions[i]) {
            case 1:
                context.fillStyle = "lightgray";
                context.fill();
                context.save();
                    context.globalAlpha = dot_alpha;
                    context.fillStyle = rhythm.color;
                    context.fill();
                context.restore();
                context.strokeStyle = "white";
                context.stroke();
                break;
            default:
                context.save();
                    context.strokeStyle = "lightgray";
                    context.stroke();
                context.restore();
                context.save();
                    context.globalAlpha = dot_alpha;
                    context.strokeStyle = rhythm.color;
                    context.stroke();
                context.restore();
                break;
        }
    }

    let playhead = playhead_position(rhythm);
    context.strokeStyle = rhythm.color;
    let angle = playhead / beatmap.measure * Math.PI * 2 - Math.PI / 2;
    let x = rhythm_radius * Math.cos(angle);
    let y = rhythm_radius * Math.sin(angle);
    context.beginPath();
    context.arc(x, y, beat_radius * 2, 0, Math.PI * 2);
    context.stroke();

    context.restore();

    draw_key_text(context, rhythm);

    // context.save();
    // context.globalAlpha = 0.5;
    // let cap = Math.min(beat_length(rhythm) / 2, HIT_DISTANCE);
    // for (let i=0; i<rhythm.subdivisions.length; i++) {
    //     context.fillStyle = "greenyellow";
    //     let a = (i * beat_length(rhythm) - cap) / beatmap.measure;
    //     let b = (i * beat_length(rhythm) + cap) / beatmap.measure;
    //     context.beginPath();
    //     context.arc(rhythm.position[0] * grid, rhythm.position[1] * grid, rhythm_radius, a * Math.PI*2 - Math.PI/2, b * Math.PI*2 - Math.PI/2);
    //     context.lineTo(rhythm.position[0] * grid, rhythm.position[1] * grid);
    //     context.closePath();
    //     context.fill();
    // }
    // context.restore();
}

function draw_beatmap(context, now) {
    if (beatmap && 'startTime' in beatmap) {
        if (!beatmap.done) {
            if (!('clearTime' in beatmap)) {
                draw_circles(context);
                
                for (let rhythm of beatmap.rhythms) {
                    draw_rhythm(context, rhythm);
                }

                if (beatmap.combo === 0) {
                    context.save();

                    context.font = (grid * INFO_FONT_SCALE) + "px " + UI_FONT;
                    context.textAlign = "right";
                    context.textBaseline = "top";
                    context.fillStyle = "black";
                    context.fillText(beatmap.bpm + " BPM", grid - 10, -grid);
                    context.textAlign = "left";
                    context.fillText(clears + " CLEARS", -grid + 10, -grid);

                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    for (let rhythm of beatmap.rhythms) {
                        context.fillText(rhythm.subdivisions.length, rhythm.position[0] * grid, grid/1.6);
                    }
                    context.fillText(":", 0, grid/1.6)

                    context.restore();
                }

                if (beatmap.combo === 0 || beatmap.adjustedElapsed - beatmap.previousMiss < beatmap.measure) {
                    context.save();
                    context.fillStyle = "yellow";
                    context.strokeStyle = "black";
                    let fullwidth = grid * 2 - 20;
                    let gap = grid/40;
                    let width = fullwidth / 4 - gap;
                    let height = grid/16;
                    for (let i=0; i<4; i++) {
                        context.beginPath();
                        context.rect((i - 2) * (width + gap) + gap/2, grid - height, width, height);
                        if (4 - i <= beatmap.spareMeasures) {
                            context.fill();
                        }
                        context.stroke();
                    }
                    context.restore();
                }
            }
        } else {
            draw_score(context, now);
        }
    } else {
        draw_intro(context);
    }
}

function handle_miss(rhythm) {
    rhythm.combo = 0;
    if (beatmap.combo > beatmap.maxCombo)
        beatmap.maxCombo = beatmap.combo;
    beatmap.combo = 0;
    rhythm.roundCombo = 0;
    beatmap.roundCombo = 0;
    beatmap.totalMisses++;
}

function handle_hit(rhythm) {
    beatmap.previousHitTime = beatmap.adjustedElapsed;
    rhythm.combo++;
    beatmap.combo++;
    rhythm.roundCombo++;
}

function update_beatmap(delta, now) {
    if (beatmap && 'startTime' in beatmap) {
        if (!beatmap.done) {
            let latency = (audioContext.baseLatency + audioContext.outputLatency) * 1000;
            beatmap.currentTime = now;
            beatmap.elapsed = now - beatmap.startTime;
            beatmap.localElapsed = beatmap.elapsed - beatmap.spawnTime;
            beatmap.adjustedElapsed = beatmap.localElapsed - latency;

            if ('clearTime' in beatmap) {
                if (beatmap.adjustedElapsed - beatmap.clearTime >= beatmap.measure / 2)
                    clear_beatmap();
                return;
            }

            if (beatmap.localElapsed >= 0) {
                let quarter = 60 / beatmap.bpm * 1000;
                let lastMetronomeTime = Math.floor(beatmap.localElapsed / quarter) * quarter;
                if (
                    !beatmap.metronomePlayed ||
                    lastMetronomeTime > beatmap.metronomePlayed
                ) {
                    beatmap.respack.metronomeSound.play();
                    beatmap.metronomePlayed = beatmap.localElapsed;
                }
            }

            let allComboReady = true;

            // key unregistration
            if (keypressed["Escape"]) {
                for (let i=beatmap.rhythms.length-1; i>=0; i--) {
                    let rhythm = beatmap.rhythms[i];
                    if ('keyCode' in rhythm && rhythm.keyCode !== "") {
                        delete rhythm.keyCode;
                        break;
                    }
                }
            }
        
            for (let rhythmIndex=0; rhythmIndex<beatmap.rhythms.length; rhythmIndex++) {
                let rhythm = beatmap.rhythms[rhythmIndex];
                let closestBeat = Math.round((beatmap.adjustedElapsed - rhythm.spawnTime) / beat_length(rhythm));
                let closestSubdivision = closestBeat % rhythm.subdivisions.length;
                let closestBeatTime = closestBeat * beat_length(rhythm) + rhythm.spawnTime;

                let unadjustedBeat = Math.round((beatmap.localElapsed - rhythm.spawnTime) / beat_length(rhythm));
                let unadjustedBeatTime = unadjustedBeat * beat_length(rhythm) + rhythm.spawnTime;
                
                if (beatmap.localElapsed >= rhythm.spawnTime - beatmap.measure) {
                    // key registration
                    if (!('keyCode' in rhythm)) {
                        if (rhythmIndex === 0 && keypressed["LeftTouch"]) {
                            rhythm.keyCode = "LeftTouch";
                        } else if (rhythmIndex === 1 && keypressed["RightTouch"]) {
                            rhythm.keyCode = "RightTouch";
                        } else {
                            if (beatmap.adjustedElapsed >= rhythm.spawnTime - beatmap.spawnLeadup) {
                                let freeKey;
                                search: for (let key in keypressed) {
                                    if (["Escape", "LeftTouch", "RightTouch"].includes(key)) continue;
                                    for (let r of beatmap.rhythms) {
                                        if (r.keyCode === key)
                                            continue search;
                                    }
                                    freeKey = key;
                                    break;
                                }
                                if (freeKey) {
                                    rhythm.keyCode = freeKey;
                                }
                            }
                        }
                    }
                }

                if (beatmap.localElapsed < rhythm.spawnTime - beat_length(rhythm)/2) {
                    // count them in
                    if (
                        rhythm.subdivisions[unadjustedBeat + rhythm.subdivisions.length] &&
                        rhythm.previousBeat !== unadjustedBeat &&
                        beatmap.localElapsed >= unadjustedBeatTime &&
                        unadjustedBeat < 0
                    ) {
                        beatmap.respack.countinSound.play();
                        rhythm.previousBeat = unadjustedBeat;
                    }
                    
                    allComboReady = false;
                    continue;
                }

                if (!('keyCode' in rhythm)) {
                    allComboReady = false;
                    rhythm.previousBeat = unadjustedBeat;
                    
                    let nextRhythm = beatmap.rhythms[rhythmIndex + 1];
                    if (nextRhythm && beatmap.adjustedElapsed >= nextRhythm.spawnTime - beatmap.measure - beatmap.measure/2) {
                        nextRhythm.spawnTime += beatmap.measure / 2;
                    }
                    continue;
                }
                
                let distance = Math.abs(beatmap.adjustedElapsed - closestBeatTime);

                if (
                    closestBeat >= 0 &&
                    closestBeat === rhythm.previousBeat &&
                    !rhythm.subdivisions[closestSubdivision] &&
                    rhythm.previousHit !== closestBeat &&
                    rhythm.previousMiss !== closestBeat &&
                    beatmap.adjustedElapsed >= closestBeatTime
                ) {
                    handle_hit(rhythm);
                    rhythm.previousHit = closestBeat;
                    spawn_perfect_particle(rhythm, closestSubdivision);
                }

                if (
                    closestBeat >= 0 &&
                    closestBeat === rhythm.previousBeat &&
                    rhythm.subdivisions[closestSubdivision] &&
                    rhythm.previousHit !== closestBeat &&
                    beatmap.adjustedElapsed > closestBeatTime &&
                    distance > Math.min(HIT_DISTANCE, beat_length(rhythm) / 2) &&
                    rhythm.previousMiss !== closestBeat
                ) {
                    handle_miss(rhythm);
                    rhythm.previousMiss = rhythm.previousBeat;
                    let previousBeatTime = rhythm.previousBeat * beat_length(rhythm) + rhythm.spawnTime;
                    if (!('previousMiss' in beatmap) || beatmap.adjustedElapsed - beatmap.previousMiss >= beatmap.measure) {
                        beatmap.spareMeasures--;
                        beatmap.previousMiss = previousBeatTime;
                        if (beatmap.spareMeasures <= 0) {
                            beatmap.clearTime = beatmap.adjustedElapsed;
                        }
                    }
                    spawn_miss_particle(rhythm, rhythm.previousBeat % rhythm.subdivisions.length);
                }

                if (rhythm.previousHit !== closestBeat) {
                    rhythm.previousHit = null;
                }
        
                if (keypressed[rhythm.keyCode]) {
                    if (
                        rhythm.subdivisions[closestSubdivision] && 
                        rhythm.previousHit !== closestBeat && 
                        distance <= Math.min(HIT_DISTANCE, beat_length(rhythm) / 2)
                    ) {
                        beatmap.respack.hitSounds[rhythmIndex].play();
                        handle_hit(rhythm);
                        rhythm.previousHit = closestBeat;
                        spawn_hit_particle(rhythm, closestSubdivision);
                    } else {
                        handle_miss(rhythm);
                        rhythm.previousMiss = closestBeat;
                        if (!('previousMiss' in beatmap) || beatmap.adjustedElapsed - beatmap.previousMiss >= beatmap.measure - 10) {
                            beatmap.spareMeasures--;
                            beatmap.previousMiss = beatmap.adjustedElapsed;
                            if (beatmap.spareMeasures <= 0) {
                                beatmap.clearTime = beatmap.adjustedElapsed;
                            }
                        }
                        spawn_miss_particle(rhythm, playhead_position(rhythm) / beat_length(rhythm));
                    }
                }

                if (rhythm.roundCombo < rhythm.subdivisions.length) {
                    allComboReady = false;
                }
        
                rhythm.previousBeat = unadjustedBeat;
            }

            if (allComboReady) {
                beatmap.respack.countdownSounds[beatmap.roundCombo].play();
                beatmap.roundCombo++;
                for (let rhythm of beatmap.rhythms) {
                    rhythm.roundCombo -= rhythm.subdivisions.length;
                }
                if (!beatmap.clearTime && beatmap.roundCombo >= 4) {
                    beatmap.clearTime = beatmap.localElapsed;
                }
                spawn_roundcombo_particle();
            }
        } else {
            // press any key to continue
            if (Object.keys(keypressed).length > 0) {
                generate_beatmap();
                start_beatmap(now);
            }
        }
    } else {
        // press any key to begin
        if (Object.keys(keypressed).length > 0) {
            generate_beatmap();
            start_beatmap(now);
        }
    }
}

function spawn_roundcombo_particle() {
    let image = new OffscreenCanvas(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
    );
    let offscreenContext = image.getContext("2d");

    offscreenContext.translate(image.width/2, image.height/2);
    offscreenContext.scale(window.devicePixelRatio, window.devicePixelRatio);

    for (const rhythm of beatmap.rhythms) {
        let x = (rhythm.position[0] + (Math.random() - 0.5)) * grid;
        let y = (rhythm.position[1] + (Math.random() * 2 - 1)) * grid;
        let scale = 2;

        offscreenContext.save();
        offscreenContext.translate(x, y);
        offscreenContext.scale(scale, scale);
        offscreenContext.globalCompositeOperation = "lighter";
        draw_rhythm_shape(offscreenContext, rhythm, 0, 0);
        if (rhythm.subdivisions.length === 2) {
            offscreenContext.lineWidth = grid / 8;
            offscreenContext.strokeStyle = rhythm.color;
            offscreenContext.stroke();
        } else {
            offscreenContext.fillStyle = rhythm.color;
            offscreenContext.fill();
        }
        offscreenContext.restore();
    }

    offscreenContext.save();
    for (let x=-window.innerWidth/2; x<=window.innerWidth/2; x+=10 + window.devicePixelRatio) {
        offscreenContext.clearRect(x, -window.innerHeight/2, 10, window.innerHeight);
    }
    for (let y=-window.innerHeight/2; y<=window.innerHeight/2; y+=10 + window.devicePixelRatio) {
        offscreenContext.clearRect(-window.innerWidth/2, y, window.innerWidth, 10);
    }
    offscreenContext.restore();

    offscreenContext.save();
    offscreenContext.globalCompositeOperation = "destination-over";
    offscreenContext.fillStyle = COMBO_TEXT_COLOR;
    let subdivisionsSum = 0;
    for (let rhythm of beatmap.rhythms) {
        subdivisionsSum += rhythm.subdivisions.length;
    }
    abc_blocks(offscreenContext, 5 - beatmap.roundCombo + "", grid * COMBO_FONT_SCALE, 0, 0, beatmap.roundCombo + subdivisionsSum, true);
    offscreenContext.restore();

    spawn_particle({
        lifetime: beatmap.measure / 2,
        a: 1,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.a;
            context.globalCompositeOperation = "destination-over";
            context.drawImage(image, -window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight);
            context.restore();
        },
        update: function(delta) { }
    })
}

function spawn_miss_particle(rhythm, subdivision) {
    const lifetime = 60 / beatmap.bpm * 1000;
    let angle = (subdivision * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(angle),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(angle),
        imageSize: beat_radius * 8 * MISS_PARTICLE_SCALE,
        r: beat_radius * 2 * MISS_PARTICLE_SCALE,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            sprites.missImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function(delta) { }
    })
}

function spawn_perfect_particle(rhythm) {
    const lifetime = 60 / beatmap.bpm * 1000;
    let playhead = playhead_position(rhythm) / beatmap.measure * Math.PI * 2 - Math.PI / 2;

    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(playhead),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(playhead),
        imageSize: beat_radius * 8,
        r: beat_radius * 2,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            sprites.hitImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function() { }
    })
}

function spawn_hit_particle(rhythm, subdivision) {
    if (rhythm.subdivisions.length > 1 && rhythm.combo >= rhythm.subdivisions.length) {
        spawn_particle({
            lifetime: beat_length(rhythm),
            x: rhythm.position[0] * grid,
            y: rhythm.position[1] * grid,
            draw: function(context) {
                context.save();
                context.globalAlpha = this.lifetime / beat_length(rhythm);
                context.strokeStyle = rhythm.color;
                draw_rhythm_shape(context, rhythm, this.x, this.y);
                context.stroke();
                context.restore();
                if (rhythm.subdivisions.length === 2) {
                    draw_key_text(context, rhythm);
                }
            },
            update: function(delta) {
                if ('clearTime' in beatmap)
                    this.lifetime = 0;
            }
        })
    }

    let angle = (subdivision * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
    const lifetime = 60 / beatmap.bpm * 1000;

    var gradient;

    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid,
        y: rhythm.position[1] * grid,
        draw: function(context) {
            if (!gradient) {
                let x = rhythm_radius * Math.cos(angle);
                let y = rhythm_radius * Math.sin(angle);
                gradient = context.createRadialGradient(
                    x, y, 0, x, y, rhythm_radius * 2.5
                );
                gradient.addColorStop(0, rhythm.color);
                gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            }
            
            context.save();
            context.globalAlpha = this.lifetime / lifetime / 4;
            context.fillStyle = gradient;
            context.translate(this.x, this.y);
            context.beginPath();
            context.arc(0, 0, rhythm_radius, 0, Math.PI * 2);
            context.fill();
            context.fill();
            context.restore();
        },
        update: function() {
            if ('clearTime' in beatmap)
                this.lifetime = 0;
        }
    })

    spawn_perfect_particle(rhythm);
}

export { draw_beatmap, update_beatmap };