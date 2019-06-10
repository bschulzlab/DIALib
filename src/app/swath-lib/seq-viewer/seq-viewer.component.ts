import {Component, ElementRef, Input, OnInit, AfterViewInit, OnChanges, Output, EventEmitter, OnDestroy} from '@angular/core';
import {D3Service, D3, ScaleLinear} from 'd3-ng2-service';
import {SeqCoordinate} from '../../helper/seq-coordinate';
import {SvgAnnotationService} from '../../helper/svg-annotation.service';
import {Observable, Subscription} from 'rxjs';
import {SwathLibHelperService} from '../../helper/swath-lib-helper.service';
import {SvgContextMenuService} from '../../helper/svg-context-menu.service';
import {SwathQuery} from "../../helper/swath-query";

@Component({
  selector: 'app-seq-viewer',
  templateUrl: './seq-viewer.component.html',
  styleUrls: ['./seq-viewer.component.scss']
})
export class SeqViewerComponent implements OnInit, OnDestroy {
  private _Seq: SeqCoordinate[];
  gridSize = 20;
  @Input() unique_id: string;
  @Output() contextEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() maxColumn: number;
  @Input() set query(q: SwathQuery) {
    this.Seq = q.seqCoord;
  }

  private _query: SwathQuery;

  set Seq(value: SeqCoordinate[]) {
    console.log('changed');
    this._Seq = value;
    const result = this.distributeRow(value, this.maxColumn, this.gridSize);
    this.data = result.data;
    this.maxRowNumber = result.maxRowNumber;
    if (this.seqBlock !== undefined) {
      this.prepareAnnotation(this.data, this.x, this.y, this.gridSize, this.maxColumn);
      this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate, this.d3, this.annotationType);
    }
  }
  get Seq(): SeqCoordinate[] {
    return this._Seq;
  }
  data;
  parentNativeElement: any;
  d3: D3;
  maxRowNumber: number;
  x;
  y;
  seqBlock;
  tooltips;
  d3Annotate;
  svg;
  annotationType;
  d3Context;
  menu;
  contextMenu;
  changeSubscribe: Subscription;
  selectedSubscribe: Subscription;
  commObject;
  constructor(element: ElementRef, private d3Service: D3Service, private annotation: SvgAnnotationService, private libHelper: SwathLibHelperService, private cm: SvgContextMenuService) {
    this.parentNativeElement = element.nativeElement;
    this.d3 = d3Service.getD3();
    this.d3Annotate = annotation.GetD3Annotation();
    this.d3Context = this.cm.GetContextMenu();
    this.annotationType = this.d3Annotate.annotationCustomType(this.d3Annotate.annotationLabel,
      {connector: {end: 'dot'},
      note:
        {
        lineType: 'horizontal',
      },

        className: 'show-bg',
    });
    console.log(this.d3Context);
    this.contextMenu = this.d3Context(this.d3);

  }

  ngOnDestroy() {
    this.changeSubscribe.unsubscribe();
    this.selectedSubscribe.unsubscribe();
  }

  CreateMenu() {
    const emit = this.contextEvent;
    this.menu = [
      {
        title: 'Edit Residue',
        action: function(elm, d, i) {
          emit.emit({residue: elm.aa.coordinate, event: 'edit'});
        }
      },
      {
        title: 'b-series Stop',
        action: function(elm, d, i) {
          emit.emit({residue: elm.aa.coordinate, event: 'bstop'});
        }
      },
        {
            title: 'Select for b-series',
            action: function(elm, d, i) {
                emit.emit({residue: elm.aa.coordinate, event: 'bselect'});
            }
        },
        {
            title: 'y-series Stop',
            action: function(elm, d, i) {
                emit.emit({residue: elm.aa.coordinate, event: 'ystop'});
            }
        },
        {
            title: 'Select for y-series',
            action: function(elm, d, i) {
                emit.emit({residue: elm.aa.coordinate, event: 'yselect'});
            }
        }
    ];
  }

  ngOnInit() {
    this.CreateMenu();
    this.commObject = this.libHelper.SequenceMap.get(this.unique_id);
    const gridSize = this.gridSize;
    const frame = {width: 640, height: 25 + gridSize + gridSize * (this.maxRowNumber + 7)};
    const margin = {top: 20, right: 20, bottom: 5, left: 40};
    const d3 = this.d3;
    let svg: any;
    const width = frame.width - margin.left - margin.right;
    const height = frame.height - margin.top - margin.bottom;
    const seqHeight = height - gridSize * 3;
    const x = d3.scaleLinear().range([0, width]).domain([0, this.maxColumn]);
    const y = d3.scaleLinear().range([0, seqHeight]).domain([0, (this.maxRowNumber + 1) * this.maxColumn ]);
    const xAxis = d3.axisTop(x).scale(x).tickValues(d3.range(1, this.maxColumn + 1, 1));
    const yTicks = d3.range(1, (this.maxRowNumber + 1) * this.maxColumn, this.maxColumn);
    const yAxis = d3.axisLeft(y).scale(y)
      // .ticks(this.maxRowNumber + 1)
      .tickValues(yTicks);
    svg = d3.select(this.parentNativeElement).append('svg')
      .attr('viewBox', '0 0 ' + frame.width + ' ' + frame.height);
    this.svg = svg;
    const graphBlock = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const xaxis = graphBlock.append('g')
      .attr('class', 'top-axis')
      .call(xAxis);

    const yaxis = graphBlock
      .append('g')
      .attr('class', 'left-axis')
      .attr('transform', 'translate(0,' + gridSize + ')')
      .call(yAxis);
    this.x = x;
    this.y = y;
    const seqBlock = graphBlock.append('g').attr('class', 'seqBlock');
    this.seqBlock = seqBlock;
    this.prepareAnnotation(this.data, x, y, gridSize, this.maxColumn);

    this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate, d3, this.annotationType);
    // svg.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 0);
    if (this.commObject) {
      this.changeSubscribe = this.commObject.change.asObservable().subscribe((data) => {
        if (data) {
          if (this.seqBlock !== undefined) {
            this.prepareAnnotation(this.data, this.x, this.y, this.gridSize, this.maxColumn);
            this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate, this.d3, this.annotationType);
          }
        }
      });
    }
    if (this.commObject) {
      this.selectedSubscribe = this.commObject.selected.asObservable().subscribe((data: number[]) => {
        const dataLength = this.data.length;
        const aaBlock = this.seqBlock.selectAll('g.aaBlock');
        aaBlock.each(
          function (d, i, n) {
            console.log(i, data);
            if (data.includes(dataLength - i - 1)) {
              d3.select(n[i]).select('.annotation-group').selectAll('g.annotation-connector, g.annotation-note').style('opacity', 1);
            }
          }
        );
      });
    }
  }

  private drawSeq(seqBlock, x, y, gridSize: number, columnNumber, d3Annotation, d3, annotationType) {
    console.log(this.data);
    seqBlock.selectAll('*').remove();
    const aas = seqBlock.selectAll('.aa').data(this.data.reverse());
    aas.exit().remove();
    const aaBlock = aas.enter().append('g').attr('class', 'aaBlock');
    const aaTextBlock = aaBlock.append('g').attr('class', 'aa');
    aaBlock.each(function (d, i, n) {
      const annotation = d3.select(n[i]).append('g').attr('class', 'annotation-group').style('font-size', '12px')
        .call(d3Annotation
          .annotation()
          .editMode(false)
          .type(annotationType)
          .annotations([d.annotation]));
      annotation.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', true);

    });

    aaTextBlock.append('rect')
      .attr('class', function (d) {
        return d.aa.modType;
      }).attr('x', function (d) {
        return x(d.column + 1) - gridSize / 2;
      }).attr('y', function (d) {
        return y(d.row * columnNumber) + gridSize / 2;
      }).attr('rx', 2).attr('ry', 2)
      .attr('height', gridSize).attr('width', gridSize)
    ;
    const aaText = aaTextBlock.append('text').attr('class', function (d) {
      return 'aaId ' + d.aa.modType;
    }).attr('x', function (d) {
      return x(d.column + 1);
    }).attr('y', function (d) {
      return y(d.row * columnNumber) + gridSize;
    }).text(function (d) {
      return d.aa.aa;
    });

    aaTextBlock.on('mouseover', function (d) {
      const current = d3.select(d3.event.currentTarget.parentNode);
      current.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', false);
    }).on('mouseout', function (d) {
      const current = d3.select(d3.event.currentTarget.parentNode);
      current.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', true);
    })
    ;

    if (this.menu) {
      aaTextBlock.on('contextmenu', this.d3Context(this.menu));
    }


    /*const annotation = aaBlock.append('g').attr('class', 'annotation-group')
      .call(function (d, i) {
        console.log(i);
        return d3Annotation
          .annotation()
          .editMode(true)
          .type(d3Annotation.annotationLabel).annotations([d.annotation]);
      });
    console.log(aaBlock);*/
    /*aaBlock.on('mouseover', function (d) {
      tooltips.transition().duration(200).style('opacity', 0.9);
      tooltips.html('Position:' + d.aa.coordinate).style('left', (d3.event.pageX) + 'px').style('top', (d3.event.pageY) + 'px');
    }).on('mouseout', function (d) {
      tooltips.style('opacity', 0);
      d3Annotation
        .annotation()
        .editMode(true)
        .type(d3Annotation.annotationLabel).accessors({
        x: d => x(d.column + 1) + gridSize / 2,
        y: d => y(d.row ) + gridSize + gridSize / 2,
          dx: gridSize * xMod,
          dy: gridSize * 2 * yMod,
      })
    });*/
  }

  distributeRow(seqCoord: SeqCoordinate[], maxColumn: number, gridSize) {
    const data = [];
    let rowNumber = 0;
    let columnNumber = 0;
    for (let i = 0; i < seqCoord.length; i++) {
      if (i % maxColumn === 0 && i !== 0) {
        rowNumber ++;
        columnNumber = 0;
      }
      let label = '';
      for (let m = 0; m < seqCoord[i].mods.length; m ++) {
        label += `- ${seqCoord[i].mods[m].name}(${seqCoord[i].mods[m].type}` + ('' || ` ${seqCoord[i].mods[m].Ytype}`) + ')\n';
      }
      console.log(label);
      data.push(
        {column: columnNumber,
          row: rowNumber,
          aa: seqCoord[i],
        });
      columnNumber ++;
    }
    return {data: data, maxRowNumber: rowNumber};
  }

  prepareAnnotation(data, x, y, gridSize, maxColumn) {
    const annotations = [];
    for (let i = 0; i < data.length; i ++ ) {
      // if (d.aa.modType !== '') {
        let xMod = 1;
        const yMod = 1;
        let align = 'left';
        if ((data[i].aa.coordinate - data[i].row * maxColumn) > 11) {
          xMod = -1;
          align = 'right';
        }
      let label = '';
      for (let m = 0; m < data[i].aa.mods.length; m ++) {
        label += `- ${data[i].aa.mods[m].name}(${data[i].aa.mods[m].type}` + ('' || ` ${data[i].aa.mods[m].Ytype}`) + ')\n';
      }
      data[i]['annotation'] = {
        note: {
          label: 'Residue Modifications:\n' + (label || 'None'),
          title: (data[i].aa.coordinate + 1) + data[i].aa.aa,
          // wrap: 150,
          wrapSplitter: /\n/,
          align: align,
          bgPadding: 20
        },
        x: x(data[i].column + 1) + gridSize / 2 * xMod,
        y: y(data[i].row * maxColumn) + gridSize + gridSize / 2,
        dx: gridSize * xMod,
        dy: gridSize * 2 * yMod,
        data: {column: data[i].column, row: data[i].row},
        color: '#E8336D',
          subject: {
          radius: 5,
          // radiusPadding: 10
        },
      };

        /*annotations.push({
          note: {
            label: d.aa.modType,
            title: (d.aa.coordinate + 1) + d.aa.aa,
            align: 'dynamics',
            lineType: 'horizontal'
          },
          x: x(d.column + 1) + gridSize / 2,
          y: y(d.row * maxColumn) + gridSize + gridSize / 2,
          dx: gridSize * xMod,
          dy: gridSize * 2 * yMod,
          data: {column: d.column, row: d.row},
          color: '#E8336D',
          className: 'show-bg',

          subject: {
            radius: 5,
            // radiusPadding: 10
          },
        });*/
      // }
    }
    return annotations;
  }

}
