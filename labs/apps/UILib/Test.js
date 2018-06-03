class TestPanel {
    constructor(container) {
        this.container = container;
        this.build();
        this.container.appendChild(this.panel);
    }
    build() {
        var frag = document.createDocumentFragment();
        this.panel = document.createElement('div');
        frag.appendChild(this.panel);
        var i1 = document.createElement('span');
        i1.classList.add('items-ph');
        i1.classList.add('hide');
        i1.innerHTML = 'item1';
        var link1 = document.createElement('a');
        link1.classList.add('list-link');
        link1.href = 'javascript:void(0)';
        link1.innerHTML = 'X';
        this.container.appendChild(frag);
    }
}
function AddPanel() {
}
