import { Injectable } from '@angular/core';
import * as d3Annotation from 'd3-svg-annotation';
@Injectable({
  providedIn: 'root'
})
export class SvgAnnotationService {

  constructor() {

  }

  GetD3Annotation() {
    return d3Annotation;
  }
}
