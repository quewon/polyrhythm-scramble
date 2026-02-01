import audioContext from "./audioContext.js";

export default class AudioSprite {
    src;
    loaded = false;
    playing = false;
    loop = false;
    _pingpong = false;
    _loopStart = 0;
    _loopEnd = 0;
    _volume = 0;
    _seeked = 0;
    _started;
    _startOffset = 0;

    buffer;
    pingpongBuffer;
    source;
    gain = audioContext.createGain();

    get pingpong() { return this._pingpong }
    set pingpong(v) {
        this._pingpong = v;
        if (v) this.generatePingpongBuffer();
    }
    get duration() {
        return this.buffer.duration;
    }
    set volume(value) {
        this.gain.gain.setValueAtTime(value, audioContext.currentTime);
        this._volume = value;
    }
    get volume() {
        return this._volume;
    }
    get currentTime() {
        if (this.source) {
            // not accurate if playbackRate changes during playback, but good enough
            // TODO:? https://github.com/kurtsmurf/whirly/blob/master/src/PlaybackPositionNode.js
            const time = this._startOffset + (audioContext.currentTime - this._started) * this.source.playbackRate.value;
            if (this.source.loop) {
                if (time < this._loopStart) {
                    return time;
                } else {
                    const loopLength = this._loopEnd - this._loopStart;
                    if (this.pingpong && (time - this._loopStart) % (loopLength * 2) > loopLength) {
                        return loopLength - (time - this._loopStart) % loopLength + this._loopStart
                    } else {
                        return (time - this._loopStart) % loopLength + this._loopStart;
                    }
                }
            } else {
                return time;
            }
        }
        return this._startOffset;
    }
    set loopStart(value) {
        const previousLoopStart = this.loopStart;
        if (this.source)
            this.source.loopStart = value;
        this._loopStart = value;
        if (this.pingpong)
            this.generatePingpongBuffer(previousLoopStart);
    }
    get loopStart() { return this._loopStart }
    set loopEnd(value) {
        if (this.source)
            this.source.loopEnd = value;
        this._loopEnd = value;
        if (this.pingpong)
            this.generatePingpongBuffer();
    }
    get loopEnd() { return this._loopEnd }
 
    constructor(options) {
        options = options || {};
        this.src = options.src;
        this.buffer = options.buffer;
        this.onload = options.onload;
        if ('loop' in options)
            this.loop = options.loop;
        this._pingpong = options.pingpong;
        this._loopStart = options.loopStart || this._loopStart;
        this._loopEnd = options.loopEnd || this._loopEnd;
        this.volume = options.volume || 1;
        this.loaded = options.loaded;
        this.loadBuffer();
    }

    async loadBuffer() {
        if (this.loaded) return;
        if (this.buffer || this.src) {
            this.buffer = this.buffer || await fetch(this.src)
                .then(res => res.arrayBuffer())
                .then(buffer => audioContext.decodeAudioData(buffer))
                .catch(err => {
                    console.error(err);
                })
        } else {
            console.log("audiosprite was not provided with a src or buffer.");
            return;
        }
        this.loaded = true;
        if (this.onload) this.onload();
    }

    generatePingpongBuffer(previousLoopStart) {
        const loopStartSample = Math.floor(this.loopStart * this.buffer.sampleRate);
        const loopEndSample = Math.floor(this.loopEnd * this.buffer.sampleRate);
        const loopLength = loopEndSample - loopStartSample;

        const crossfadeSamples = Math.floor(0.05 * this.buffer.sampleRate);

        const newBuffer = audioContext.createBuffer(this.buffer.numberOfChannels, this.buffer.length + loopLength, this.buffer.sampleRate);
        for (let channel=0; channel<this.buffer.numberOfChannels; channel++) {
            const originalData = this.buffer.getChannelData(channel);
            const loopData = originalData.slice(loopStartSample, loopEndSample);
            const tailData = originalData.slice(loopEndSample, this.buffer.length);

            const newData = newBuffer.getChannelData(channel);
            newData.set(originalData);
            newData.set(loopData.reverse(), loopEndSample);
            newData.set(tailData, loopEndSample + loopLength);

            for (let fadepoint of [loopEndSample, loopEndSample + loopLength]) {
                const crossfadeStart = fadepoint - crossfadeSamples;
                for (let i = 0; i < crossfadeSamples; i++) {
                    const fadeOut = 1 - (i / crossfadeSamples);
                    const fadeIn = i / crossfadeSamples;
                    
                    const endSample = newData[crossfadeStart + i];
                    const startSample = newData[loopStartSample + i];
                    newData[crossfadeStart + i] = endSample * fadeOut + startSample * fadeIn;
                }
            }
        }

        this.pingpongBuffer = newBuffer;
        
        if (this.source) {
            if (this.currentTime > (previousLoopStart || this.loopStart)) {
                this.play(this.loopStart + this.currentTime % (this.loopEnd - this.loopStart));
            } else {
                this.play();
            }
        }
    }

    createSource() {
        const source = audioContext.createBufferSource();
        if (this.loop && this.pingpong) {
            source.buffer = this.pingpongBuffer;
        } else {
            source.buffer = this.buffer;
        }
        if (this.loop) {
            source.loopStart = this._loopStart;
            if (this.pingpong) {
                source.loopEnd = this._loopEnd + (this._loopEnd - this._loopStart);
            } else {
                source.loopEnd = this._loopEnd;
            }
        }
        source.loop = this.loop;
        source.onended = () => {
            if (this.source === source)
                this.stop();
        };
        source.connect(this.gain);
        return source;
    }

    seek(value) {
        this._seeked = value || 0;
    }

    play(start, duration) {
        if (!this.loaded) {
            console.error("tried to play a sound that wasn't loaded.");
            return;
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        if (this.source)
            this.source.stop();

        this.source = this.createSource();
        this.gain.connect(audioContext.destination);
        this.gain.gain.setValueAtTime(this.volume, audioContext.currentTime);

        this._started = audioContext.currentTime;
        this._startOffset = start || this._seeked;
        this.source.start(0, this._startOffset, duration);
        this._seeked = 0;
        this.playing = true;
    }

    stop() {
        if (this.source) {
            this.source.stop();
            this.source = null;
            if (this.onended) this.onended();
            this.gain.disconnect();
            this.playing = false;
        }
    }
}