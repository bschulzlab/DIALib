import { Injectable } from '@angular/core';
import {Protein} from './protein';
import {Modification} from './modification';
import {FastaFile} from './fasta-file';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable()
export class FastaFileService {
  private _fastaSource = new BehaviorSubject<FastaFile>(null);
  fastaFileReader = this._fastaSource.asObservable();
  constructor() { }


  async fileHandler(e) {
    return new Promise<FastaFile>((resolve, reject) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      const result: Protein[] = [];
      let unique_id = 1;
      let currentP = new Protein('', '', new Map<string, Modification>());
      reader.onload = (event) => {
        const loadedFile = reader.result;
        const lines = (<string>loadedFile).split(/\r\n|\n/);
        lines.map((line) => {
          console.log(line);
          if (line.length > 0) {
            if (line.startsWith('>', 0)) {
              if (currentP.id !== '') {
                currentP.unique_id = unique_id.toString();
                result.push(currentP);
                currentP = new Protein(line.slice(1), '', new Map<string, Modification>());
                unique_id += 1;
              } else {
                currentP.id = line.slice(1);
              }
            } else {
              currentP.sequence += line;
            }
          }
          // console.log(currentP);
        });
        currentP.unique_id = unique_id.toString();
        result.push(currentP);
        resolve(new FastaFile(file.name, result));
      };
      reader.readAsText(file);
    });
  }

  private ProcessFastaFormat(loadedFile, currentP, unique_id: number, result: Protein[], resolve, fileName) {

    const lines = loadedFile.split(/\r\n|\n/);
    lines.map((line) => {
      console.log(line);
      if (line.length > 0) {
        if (line.startsWith('>', 0)) {
          if (currentP.id !== '') {
            currentP.unique_id = unique_id.toString();
            result.push(currentP);
            currentP = new Protein(line.slice(1), '', new Map<string, Modification>());
            unique_id += 1;
          } else {
            currentP.id = line.slice(1);
          }
        } else {
          currentP.sequence += line;
        }
      }
      // console.log(currentP);
    });
    currentP.unique_id = unique_id.toString();
    result.push(currentP);
    resolve(new FastaFile(fileName, result));
  }

  readRawFasta(rawFasta: string) {
    let unique_id = 1;
    let currentP = new Protein('', '', new Map<string, Modification>());
    return new Promise<FastaFile>((resolve, reject) => {
      const result: Protein[] = [];
      const lines = rawFasta.split(/\r\n|\n/);
      lines.map((line) => {
        console.log(line);
        if (line.length > 0) {
          if (line.startsWith('>', 0)) {
            if (currentP.id !== '') {
              currentP.unique_id = unique_id.toString();
              result.push(currentP);
              currentP = new Protein(line.slice(1), '', new Map<string, Modification>());
              unique_id += 1;
            } else {
              currentP.id = line.slice(1);
            }
          } else {
            currentP.sequence += line;
          }
        }
        // console.log(currentP);
      });
      currentP.unique_id = unique_id.toString();
      result.push(currentP);
      resolve(new FastaFile('libary.fasta', result));
    });

  }

  UpdateFastaSource(data) {
    this._fastaSource.next(data);
    console.log(data);
  }

  CalculateScore(window: number, sequence: string, moddedPositions: number[] = [], seqId, score = []): Array<number> {
    moddedPositions = moddedPositions.sort((a, b) => a - b);
    const seqLength = sequence.length;
    const windowHalf = (window - 1) / 2;
    let currentBlock = {seq: seqId, aa: [], value: 0, position: [], gap: false, start: 0, end: 0};
    for (let i = 0; i < seqLength; i++) {
      let backward = 0;
      if (i > windowHalf) {
        backward = i - windowHalf;
      }
      let forward = 0;
      if (i + 1 > seqLength - windowHalf) {
        forward = seqLength;
      } else {
        forward = i + windowHalf + 1;
      }
      const seq = sequence.slice(backward, forward);
      let count = 0;

      for (let m = 0; m < moddedPositions.length; m ++) {
        if (backward <= moddedPositions[m] && moddedPositions[m] < forward) {
          count++;
        }
      }
      const value = count / seq.length;
      if (sequence[i] === '-') {
        if (!currentBlock.gap) {
          score.push(Object.assign({}, currentBlock));
          currentBlock = {seq: seqId, aa: ['-'], value: value, position: [i], gap: true, start: i, end: i + 1};
        } else {
          if (value !== currentBlock.value) {
            score.push(Object.assign({}, currentBlock));
            currentBlock = {seq: seqId, aa: ['-'], value: value, position: [i], gap: true, start: i, end: i + 1};
          } else {
            currentBlock.aa.push('-');
            currentBlock.position.push(i);
            currentBlock.end = i + 1;
          }
        }
      } else {
        if (currentBlock.gap) {
          score.push(Object.assign({}, currentBlock));
          currentBlock = {seq: seqId, aa: [sequence[i]], value: value, position: [i], gap: false, start: i, end: i + 1};
        } else {
          if (value !== currentBlock.value) {
            score.push(Object.assign({}, currentBlock));
            currentBlock = {seq: seqId, aa: [sequence[i]], value: value, position: [i], gap: false, start: i, end: i + 1};
          } else {
            currentBlock.end = i + 1;
            currentBlock.aa.push(sequence[i]);
            currentBlock.position.push(i);
          }

        }
      }
      // console.log(currentBlock);
      // score.push({seq: seqId, aa: [sequence[i]], value: count / seq.length, position: [i], gap: sequence[i] === '-', start: i, end: i + 1});
    }
    score.push(Object.assign({}, currentBlock));
    return score;
  }
}
