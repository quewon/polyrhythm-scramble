import AudioSprite from "./audio/AudioSprite.js";

const soundpacks = [
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/guitar/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/hit.wav" }),
        ],
        sustainSounds: [
            new AudioSprite({ src: "res/packs/doubles/guitar/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/sustain.wav" }),
        ],
        releaseSounds: [
            new AudioSprite({ src: "res/packs/doubles/guitar/1/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/1/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/release.wav" }),
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/countdown/newyear/4.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/3.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/2.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/guitar/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/guitar/countin.wav" }),
    },
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/vox/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/2/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/2/hit.wav" }),
        ],
        sustainSounds: [
            new AudioSprite({ src: "res/packs/doubles/vox/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/2/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/2/sustain.wav" }),
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/countdown/newyear/4.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/3.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/2.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/vox/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/vox/countin.wav" }),
    },
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/hit.wav" }),
        ],
        sustainSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/sustain.wav" }),
        ],
        releaseSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/1/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/release.wav" }),
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

export default soundpacks;