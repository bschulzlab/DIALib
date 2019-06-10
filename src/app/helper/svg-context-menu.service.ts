import { Injectable } from '@angular/core';
import contextMenuFactory from 'd3-context-menu';

@Injectable({
  providedIn: 'root'
})
export class SvgContextMenuService {

  constructor() { }

  GetContextMenu() {
    console.log(contextMenuFactory);
    return contextMenuFactory;
  }
}
