class Panel extends HTMLDivElement {
    constructor() {
        super(...arguments);
        this.height = '100%';
        this.display = 'block';
    }
}
class VPanel extends Panel {
}
class HPanel extends Panel {
}
class SpanItem extends HTMLSpanElement {
    constructor() {
        super(...arguments);
        this.cls = '';
    }
}
