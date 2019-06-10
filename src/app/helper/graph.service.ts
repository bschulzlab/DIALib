import { Injectable } from '@angular/core';
import {ColorGradient} from './color-gradient';
import {D3} from 'd3-ng2-service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor() { }

  CreateColorScale(d3: D3, colors: string[], scaleDomain) {
    const colourRange = d3.range(0, 1, 1.0 / (colors.length - 1));
    colourRange.push(1);
    const colorSc = d3.scaleLinear<string>().domain(colourRange).range(colors)
      .interpolate(d3.interpolateHcl)
    ;
    const colorInterpolate = d3.scaleLinear().domain(scaleDomain).range([0, 1]);
    return {colorInterpolate, colorSc};
  }

  CreateColorGradient(svg: any, colors = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'], gradientName = 'linear-gradient'): ColorGradient {
    const defs = svg.append('defs');
    const linearGrad = defs.append('linearGradient')
      .attr('id', gradientName)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data(colors)
      .enter().append('stop')
      .attr('offset', function (d, i) {
        return i / (colors.length - 1);
      }).attr('stop-color', function (d) {
        return d;
      });
    return new ColorGradient(gradientName, colors);
  }

  CreateColorsGradientLegend(svg: any, legendXPosition: number, legendYPosition: number, d3: D3, legendWidth: number, legendHeight: number, gradientName: string, scaleDomain: number[]) {
    const legendBlock = svg.append('g').attr('transform', 'translate(' + legendXPosition + ',' + legendYPosition + ')');
    const legend = legendBlock.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#' + gradientName + ')');
    const legendScale = d3.scaleLinear().range([0, legendWidth]).domain(scaleDomain);
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(10)
      .tickSize(1)
      .scale(legendScale);
    legendBlock
      .append('g')
      .attr('class', 'axisGradient')
      .attr('transform', 'translate(0,' + legendHeight + ')')
      .call(legendAxis);
    legendBlock.selectAll('path').style('opacity', 0);
    return {legendBlock, legendAxis};
  }
}

