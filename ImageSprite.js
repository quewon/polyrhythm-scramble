export default class ImageSprite {
    element;
    width = 0;
    height = 0;

    constructor(options) {
        this.element = new Image();
        this.element.src = options.src;
        this.element.onload = () => {
            this.width = options.width || this.element.naturalWidth;
            this.height = options.height || this.element.naturalHeight;
        }
    }

    draw(context, x, y, w, h) {
        w = w || this.width;
        h = h || this.height;
        context.drawImage(this.element, x - w/2, y - h/2, w, h);
    }
}