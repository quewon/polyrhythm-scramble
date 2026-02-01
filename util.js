export function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

export function smoothstep(x) {
    return x * x * (3 - 2 * x);
}