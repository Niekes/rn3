import {
    select,
    timer,
} from 'd3';

import {
    addCanvas,
    updateCanvas,
    createVirtualCanvas,
} from '../utils/canvas';

/*
    Define default settings
*/
const defaultSettings = {
    margin: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    transition: {
        duration: 500,
    },
};

export default class Barchart3d {
    constructor(data) {
        this.data = data;

        /*
            Merge settings
        */
        this.settings = {
            ...defaultSettings,
            ...this.data.settings,
        };

        /*
            Setup canvas
        */
        this.canvas = addCanvas.call(this);

        /*
            Setup virtual canvas
        */
        this.virtualCanvas = createVirtualCanvas.call(this);

        /*
            Setup virtual context
        */
        this.virtualContext = this.virtualCanvas.node().getContext('2d');

        /*
            Create detached container
        */
        this.detachedContainer = select(document.createElement('custom'));
    }

    update(updatedData) {
        this.canvas = updateCanvas.call(this);

        this.context = this.canvas.node().getContext('2d');
        this.context.scale(2, 2);

        const bars = this.detachedContainer
            .selectAll('custom.bars')
            .data(updatedData.values, d => d.id);

        bars
            .enter()
            .append('custom')
            .attr('class', 'bars')
            .attr('x0', 10)
            .attr('y0', 10)
            .attr('fill', 'red')
            .attr('height', 10)
            .attr('width', 10);

        const d3timer = timer((elapsed) => {
            this.draw();

            if (elapsed > this.settings.transition.duration) {
                d3timer.stop();
            }
        });
    }

    draw() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fill();

        this.virtualContext.clearRect(0, 0, this.width, this.height);
        this.virtualContext.fill();

        const bars = this.detachedContainer.selectAll('custom.bars');

        bars.each((d, i, nodes) => {
            const node = select(nodes[i]);

            this.context.save();
            this.context.beginPath();
            this.context.fillStyle = node.attr('fill');
            this.context.rect(
                0,
                0,
                10,
                10,
            );
            this.context.fill();
            this.context.clip();
        });
    }
}
