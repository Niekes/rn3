import {
    select,
    timer,
    scaleBand,
    scaleLinear,
    color,
} from 'd3';

import Chart from '../Chart';

import defaultSettings from './default-settings';

export default class Barchart extends Chart {
    constructor(data) {
        super(data, defaultSettings);
    }

    update(updatedData) {
        /*
            Merge settings
        */
        this.mergeSettings(this.settings, updatedData.settings);

        /*
            Update canvas
        */
        this.updateCanvas();

        /*
            Update scales
        */
        this.xScale = scaleBand()
            .range([0, this.width])
            .padding(this.settings.xScale.padding);

        this.yScale = scaleLinear()
            .range([this.height, 0]);

        /*
            Compute domain
        */
        const domainX = this.settings.xScale.domain(updatedData.values);
        const domainY = this.settings.yScale.domain(updatedData.values);

        /*
            Update domains of x & y scales
        */
        this.xScale.domain(domainX).range([0, this.width]);
        this.yScale.domain(domainY).range([this.height, 0]);

        /*
            BARS
        */
        const bars = this.detachedContainer
            .selectAll('custom.bars')
            .data(updatedData.values, d => d.id);

        bars
            .enter()
            .append('custom')
            .attr('class', 'bars')
            .attr('x', this.setXPositionOfBars.bind(this))
            .attr('y', this.getYScale0.bind(this))
            .attr('fill', d => d.fill)
            .attr('height', 0)
            .attr('width', this.setWidthOfBars.bind(this))
            .merge(bars)
            .transition()
            .duration(this.settings.transition.duration)
            .ease(this.settings.transition.ease)
            .attr('x', this.setXPositionOfBars.bind(this))
            .attr('y', this.setYPositionOfBars.bind(this))
            .attr('fill', d => d.fill)
            .attr('height', this.setHeightOfBars.bind(this))
            .attr('width', this.setWidthOfBars.bind(this));

        bars
            .exit()
            .transition()
            .duration(this.settings.transition.duration)
            .ease(this.settings.transition.ease)
            .attr('height', 0)
            .attr('y', this.getYScale0.bind(this));

        /*
            X TICKS
        */
        const xTicks = this.detachedContainer
            .selectAll('custom.x-ticks')
            .data(updatedData.values, d => d.id);

        xTicks
            .enter()
            .append('custom')
            .attr('class', 'x-ticks')
            .attr('x', this.setXPositionOfXTicks.bind(this))
            .attr('y', this.getYScale0.bind(this))
            .attr('fill', () => {
                const c = color('#000');

                c.opacity = 0;

                return c;
            })
            .attr('height', 0)
            .merge(xTicks)
            .transition()
            .duration(this.settings.transition.duration)
            .ease(this.settings.transition.ease)
            .attr('x', this.setXPositionOfXTicks.bind(this))
            .attr('y', this.setYPositionOfXTicks.bind(this))
            .attr('fill', '#000')
            .attr('height', d => (d.value > 0
                ? this.settings.xAxis.tickSize
                : this.settings.xAxis.tickSize));

        xTicks
            .exit()
            .transition()
            .duration(this.settings.transition.duration)
            .ease(this.settings.transition.ease)
            .attr('fill', () => {
                const c = color('#000');

                c.opacity = 0;

                return c;
            })
            .remove();

        /*
            Y TICKS
        */
        const yTicks = this.detachedContainer
            .selectAll('custom.y-ticks')
            .data(this.yScale.ticks(this.settings.yAxis.ticks));

        yTicks
            .enter()
            .append('custom')
            .attr('class', 'y-ticks')
            .attr('x', this.setXPositionOfYTicks.bind(this))
            .attr('y', this.setYPositionOfYTicks.bind(this))
            .attr('fill', () => {
                const c = color('#000');

                c.opacity = 0;

                return c;
            })
            .attr('width', 0)
            .merge(yTicks)
            .transition()
            .duration(this.settings.transition.duration)
            .ease(this.settings.transition.ease)
            .attr('x', this.setXPositionOfYTicks.bind(this))
            .attr('y', this.setYPositionOfYTicks.bind(this))
            .attr('fill', '#000')
            .attr('width', this.settings.yAxis.tickSize);

        yTicks
            .exit()
            .transition()
            .duration(this.settings.transition.duration)
            .ease(this.settings.transition.ease)
            .attr('fill', () => {
                const c = color('#000');

                c.opacity = 0;

                return c;
            })
            .remove();

        const d3timer = timer((elapsed) => {
            this.draw();

            if (elapsed > this.settings.transition.duration) {
                d3timer.stop();
            }
        });
    }

    draw() {
        this.context.clearRect(
            -this.settings.margin.left,
            -this.settings.margin.top,
            this.width * 2,
            this.height * 2,
        );
        this.context.fill();

        this.virtualContext.clearRect(0, 0, this.width, this.height);
        this.virtualContext.fill();

        const bars = this.detachedContainer.selectAll('custom.bars');

        bars.each((d, i, nodes) => {
            const node = select(nodes[i]);

            this.context.beginPath();
            this.context.fillStyle = node.attr('fill');
            this.context.rect(
                +node.attr('x'),
                +node.attr('y'),
                +node.attr('width'),
                +node.attr('height'),
            );
            this.context.fill();
        });

        this.context.textBaseline = 'middle';
        this.context.textAlign = 'center';

        const xTicks = this.detachedContainer.selectAll('custom.x-ticks');

        xTicks.each((d, i, nodes) => {
            const node = select(nodes[i]);

            this.context.beginPath();
            this.context.fillStyle = node.attr('fill');
            this.context.moveTo(+node.attr('x'), +node.attr('y'));
            this.context.lineTo(+node.attr('x'), +node.attr('y') + +node.attr('height'));
            this.context.strokeStyle = node.attr('fill');
            this.context.stroke();
            this.context.fillText(
                d.id,
                +node.attr('x'),
                d.value > 0
                    ? +node.attr('y') + +node.attr('height') + this.settings.xAxis.tickSize
                    : +node.attr('y') + +node.attr('height') - (this.settings.xAxis.tickSize * 2),
            );
        });

        this.context.textAlign = 'right';

        const yTicks = this.detachedContainer.selectAll('custom.y-ticks');

        yTicks.each((d, i, nodes) => {
            const node = select(nodes[i]);
            this.context.beginPath();
            this.context.fillStyle = node.attr('fill');
            this.context.moveTo(+node.attr('x'), +node.attr('y'));
            this.context.lineTo(+node.attr('x') + +node.attr('width'), +node.attr('y'));
            this.context.strokeStyle = node.attr('fill');
            this.context.stroke();
            this.context.fillText(
                d,
                +node.attr('x') - +node.attr('width'),
                +node.attr('y'),
            );
        });
    }

    getYScale0() {
        return this.yScale(0);
    }

    setXPositionOfBars(d) {
        return this.xScale(d.id);
    }

    setYPositionOfBars(d) {
        return Math.min(this.getYScale0(), this.yScale(d.value));
    }

    setWidthOfBars() {
        return this.xScale.bandwidth();
    }

    setHeightOfBars(d) {
        return Math.abs(this.yScale(d.value) - this.getYScale0());
    }

    setXPositionOfXTicks(d) {
        return this.xScale(d.id) + this.xScale.bandwidth() / 2;
    }

    setYPositionOfXTicks(d) {
        return d.value > 0
            ? this.yScale(0)
            : this.yScale(0) - this.settings.xAxis.tickSize;
    }

    setXPositionOfYTicks() {
        return this.xScale(0);
    }

    setYPositionOfYTicks(d) {
        return this.yScale(d);
    }
}
