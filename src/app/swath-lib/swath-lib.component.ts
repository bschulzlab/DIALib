import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SwathLibAssetService, SwathResponse} from '../helper/swath-lib-asset.service';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import {FastaFileService} from '../helper/fasta-file.service';
import {Modification} from '../helper/modification';
import {FastaFile} from '../helper/fasta-file';
import {SwathQuery} from '../helper/swath-query';
import {SwathResultService} from '../helper/swath-result.service';
import {Subscription} from 'rxjs';
import {DataStore} from '../helper/data-row';
import {FileHandlerService} from '../helper/file-handler.service';
import {AnnoucementService} from '../helper/annoucement.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Protein} from '../helper/protein';
import {SwathLibHelperService} from '../helper/swath-lib-helper.service';
import {UniprotService} from '../helper/uniprot.service';
import {ElectronService} from '../providers/electron.service';
import {FileService} from '../providers/file.service';
import {DigestRule} from "../helper/digest-rule";

@Component({
  selector: 'app-swath-lib',
  templateUrl: './swath-lib.component.html',
  styleUrls: ['./swath-lib.component.scss'],
  providers: [UniprotService],
})
export class SwathLibComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trypticDigest') trypticDigest;
  @ViewChild('queryForm') queryForm;
  currentAllBoxes = true;
  fileDownloader;
  form: FormGroup;
  ff;
  sf;
  fasta: Observable<FastaFile>;
  finished: boolean;
  selectedStaticMods: Observable<Modification[]>;
  private _selectedSource = new Subject<Modification[]>();
  result: Observable<SwathResponse>;
  fastaContent: FastaFile;
  resultReader: Observable<DataStore>;
  digestRules: Observable<DigestRule[]>;
  outputSubscription: Subscription;
  rt = [];
  passForm: FormGroup;
  errSub: Subscription;
  fastaRaw = '';
  file;
  digestMap;
  fileName = '';
  tempFastaContent;
  uniprotSub: Subscription;
  uniprotMap: Map<string, Protein>;
  colorMap: Map<boolean, string> = new Map<boolean, string>([[true, '-primary'], [false, '']]);
  regexFilter;
  filterChoice;
  acceptTrack = 0;
  acceptedProtein = [];
  rtSub: Subscription;
  batchDigestRule;
  constructor(private mod: SwathLibAssetService, private fastaFile: FastaFileService, private fb: FormBuilder,
              private srs: SwathResultService, private _fh: FileHandlerService, private anSer: AnnoucementService,
              private modalService: NgbModal, private swathHelper: SwathLibHelperService, private uniprot: UniprotService, private electron: ElectronService, private fileService: FileService) {

    this.selectedStaticMods = this._selectedSource.asObservable();
    this.result = mod.result;
    this.ff = fastaFile.fileHandler;
    this.sf = _fh.fileHandler;
    this.createForm();
    this.fasta = this.fastaFile.fastaFileReader;
    this.resultReader = srs.OutputReader;
    this.digestRules = this.mod.digestRulesReader;
    for (let i = 1; i <= 60; i++) {
      this.rt.push(i);
    }
    this.swathHelper.updateRT(this.rt);
    this.fileDownloader = this._fh.saveFile;
    this.regexFilter = this.swathHelper.regexFilter;
  }

  ngOnInit() {
    // this._fh.setMitmLocation('https://jimmywarting.github.io/StreamSaver.js/mitm.html');
    console.log(window.location);
    this._fh.setMitmLocation(location.protocol + '//' +
      window.location.host +
      //'schulzlab.glycoproteo.me' +
      '/assets/StreamSaver.js/mitm.html');
    this._fh.mitmLocation();
    this.rtSub = this.swathHelper.rtObservable.subscribe((data) => {
      this.rt = data;
    });
    console.log(this._fh.checkSaveStreamSupport());

    this.mod.getAssets('assets/digest_rules.json').subscribe((resp) => {
      this.mod.updateDigestRules(resp.body['data']);
    });

    this.uniprotSub = this.uniprot.UniprotResult.subscribe((data) => {
      if (data.DataFrame) {
        const seqColumn = data.DataFrame.columnMap.get('Sequence');
        const idColumn = data.DataFrame.columnMap.get('Entry');
        for (const r of data.DataFrame.data) {
          this.uniprotMap.get(r.row[idColumn]).sequence = r.row[seqColumn];
        }
      }
    });
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
    this.errSub.unsubscribe();
    this.uniprotSub.unsubscribe();
    this.rtSub.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': [],
      'rt': [],
      'windows': [],
      'oxonium': [],
      'extra-mass': 0,
      'precursor-charge': 2,
      'max-charge': 2,
      'ion-type': [],
      'variable-bracket-format': 'windows'
    });
  }

  applyModification(form: FormGroup) {
    this.form = form;
    console.log(this.form);
    this.swathHelper.SequenceMap = new Map();
    this.swathHelper.queryMap = new Map<string, SwathQuery>();
    this.passForm = Object.create(this.form);
    this.swathHelper.updateForm(this.form);
    this.fastaFile.UpdateFastaSource(new FastaFile(this.fastaContent.name, this.acceptedProtein));
  }

  private updateContent() {
    this.swathHelper.SequenceMap = new Map();
    this.swathHelper.queryMap = new Map<string, SwathQuery>();
    this.form = this.queryForm.form;
    this.passForm = Object.create(this.form);
    const accept = [];
    for (const i of this.fastaContent.content) {
      if (this.digestMap[i.unique_id].accept) {
        if (i.sequence !== '') {
          accept.push(i);
        }
      }
    }
    this.acceptedProtein = accept;
    this.swathHelper.updateForm(this.form);
    console.log(this.form);
    this.fastaFile.UpdateFastaSource(new FastaFile(this.fastaContent.name, accept));
  }

  ngAfterViewInit() {

  }

  handleFile(e) {
    if (e.target) {
      this.file = e;
      this.fileName = e.target.files[0].name;
    }
  }

  async loadFasta(e) {
    if (e) {
      this.fastaContent = await this.ff(e);
    }
  }




  async processFastaContent() {
    console.log('started');
    if (this.fastaRaw !== '') {
      this.fastaContent = await this.fastaFile.readRawFasta(this.fastaRaw);
      // this.passForm = Object.create(this.form);
      // this.fastaFile.UpdateFastaSource(Object.create(this.fastaContent));
    } else {
      await this.loadFasta(this.file);
    }
    this.digestMap = {};
    for (const f of this.fastaContent.content) {
      this.digestMap[f.unique_id] = {autoCleave: false, misCleave: '', rules: {}, accept: true};
    }

    this.acceptTrack = this.fastaContent.content.length;
    this.modalService.open(this.trypticDigest, {size: 'lg'});
    // this.updateContent();
  }

  acceptContent() {
    this.updateContent();
    this.modalService.dismissAll();
  }

  digestAllSelected(fasta: FastaFile) {
    for (const a of fasta.content) {
      if (this.digestMap[a.unique_id].accept) {
        this.digestMap[a.unique_id].rules = this.batchDigestRule;
        this.digest(a);
      }
    }
  }

  digest(protein: Protein) {
    const digestMap = this.swathHelper.mapDigestRule(this.digestMap[protein.unique_id].rules);
    const a = this.digestMap[protein.unique_id].misCleave.split(',');
    const numa = [];
    for (const n of a) {
      numa.push(parseInt(n, 10) - 1);
    }
    const positionMap = protein.Digest(digestMap, numa);
    const p = Array.from(positionMap.keys());
    console.log(p);
    let sequences = [];
    if (p.length > 0) {
      if (this.digestMap[protein.unique_id].autoCleave) {
        if (p.length > 1) {
          for (let i = 0; i <= p.length; i ++) {
            const res1 = [];
            let nTrue = 0;
            while (nTrue < p.length - i) {
              res1.push(true);
              nTrue ++;
            }

            let nFalse = p.length;
            while (nFalse > p.length - i) {
              res1.push(false);
              nFalse --;
            }
            if (nTrue === p.length || nFalse === 0) {
              sequences = this.getCleavedSeq(p, positionMap, res1, protein, sequences);
            } else {
              const perm = this.swathHelper.permutations(res1);
              for (const i3 of perm) {
                const combination = JSON.parse(i3);
                sequences = this.getCleavedSeq(p, positionMap, combination, protein, sequences);
                // console.log(sequences);
              }
            }
          }
        } else {
          sequences = this.getCleavedSeq(p, positionMap, [true], protein, sequences);
          sequences = this.getCleavedSeq(p, positionMap, [false], protein, sequences);
        }
      } else {
        const c = [];
        for (const b of p) {
          c.push(true);
        }
        sequences = this.getCleavedSeq(p, positionMap, c, protein, sequences);
      }
      // console.log(sequences);
      this.tempFastaContent = new FastaFile(this.fastaContent.name, this.fastaContent.content.slice());
      const newContent = [];
      for (let i = 0; i < this.fastaContent.content.length; i ++) {
        if (this.fastaContent.content[i].unique_id !== protein.unique_id) {
          newContent.push(this.fastaContent.content[i]);
        } else {
          for (let i2 = 0; i2 < sequences.length; i2 ++) {
            const coord = JSON.parse(sequences[i2]);
            const pr = new Protein(protein.id,
              this.fastaContent.content[i].sequence.slice(coord[0], coord[1]), new Map<string, Modification>());
            if (this.fastaContent.content[i].metadata !== undefined) {
              pr.metadata = {};
              pr.metadata.original = this.fastaContent.content[i].metadata.original;
              pr.metadata.originalStart = this.fastaContent.content[i].metadata.originalStart + coord[0];
              pr.metadata.originalEnd = this.fastaContent.content[i].metadata.originalStart + coord[1];
              pr.id = pr.id + '_' + (pr.metadata.originalStart + 1) + '_' + pr.metadata.originalEnd;
            } else {
              pr.metadata = {original: this.fastaContent.content[i], originalStart: coord[0], originalEnd: coord[1]};
              pr.id = pr.id + '_' + (pr.metadata.originalStart + 1) + '_' + pr.metadata.originalEnd;
            }
            pr.unique_id = protein.unique_id + '_' + (i2 + 1);
            pr.original = false;
            newContent.push(pr);
          }
        }
      }
      this.fastaContent.content = newContent;
      const dm = {};
      this.acceptTrack = 0;
      for (const f of this.fastaContent.content) {
        if (this.digestMap[f.unique_id]) {
          dm[f.unique_id] = this.digestMap[f.unique_id];
        } else {
          dm[f.unique_id] = {autoCleave: false, misCleave: '', rules: {}, accept: true};
        }
        if (dm[f.unique_id].accept) {
          this.acceptTrack ++;
        }
      }
      this.digestMap = dm;
    }

  }

  getCleavedSeq(position, positionMap, combination, protein, sequences?) {
    let currentPos = 0;
    if (sequences === undefined) {
      sequences = [];
    }

    for (let i = 0; i < position.length; i ++) {
      if (combination[i]) {
        switch (positionMap.get(position[i])) {
          case 'N':
            if (position[i] > 0) {
              const s = JSON.stringify([currentPos, position[i]]);
              if (!sequences.includes(s)) {
                sequences.push();
              }
              currentPos = position[i];
            }
            break;
          case 'C':
            if (position[i] < protein.sequence.length - 1) {
              const s = JSON.stringify([currentPos, position[i] + 1]);
              if (!sequences.includes(s)) {
                sequences.push(s);
              }
              currentPos = position[i] + 1;
            }
            console.log(sequences);
            break;
        }
      }
    }
    const p = protein.sequence.slice(currentPos);
    if (p !== '') {
      const s = JSON.stringify([currentPos, protein.sequence.length]);
      if (!sequences.includes(s)) {
        sequences.push(s);
      }
    }
    return sequences;
  }

  changeAllBox() {
    this.currentAllBoxes = !this.currentAllBoxes;
    for (const b of Object.keys(this.digestMap)) {
      if (this.digestMap[b]) {
        if (this.digestMap[b]['accept'] !== this.currentAllBoxes) {
          if (this.digestMap[b].accept) {
            this.acceptTrack --;
          } else {
            this.acceptTrack ++;
          }
        }
        this.digestMap[b]['accept'] = this.currentAllBoxes;
      }
    }
  }

  exportFasta() {
    let txtContent = '';
    for (const i of this.fastaContent.content) {
      if (this.digestMap[i.unique_id].accept) {
        txtContent += i.ToFasta();
      }
    }
    this._fh.saveFile(new Blob([txtContent], {'type': 'text/plain;charset=utf-8;'}), this.fastaContent.name);
  }

  fetchUniprot() {
    const allId = [];
    this.uniprotMap = new Map<string, Protein>();
    for (let i = 0; i < this.fastaContent.content.length; i ++) {
      console.log('fetching ' + this.fastaContent.content[i].id);
      if (this.digestMap[this.fastaContent.content[i].unique_id].accept) {
        const accession = this.uniprot.Re.exec(this.fastaContent.content[i].id.toUpperCase());
        if (accession !== null) {
          allId.push(accession[0]);
          this.uniprotMap.set(accession[0], this.fastaContent.content[i]);
        }
      }
    }
    if (allId.length > 0) {
      this.uniprot.UniProtParseGet(allId, false);
    }
  }

  filterSeq() {
    if (this.filterChoice !== undefined) {
      for (let i = 0; i < this.fastaContent.content.length; i ++) {
        if (this.digestMap[this.fastaContent.content[i].unique_id].accept) {
          if (this.fastaContent.content[i].metadata) {
            if (this.fastaContent.content[i].metadata.originalEnd + this.filterChoice.offset < this.fastaContent.content[i].metadata.original.sequence.length) {
              this.digestMap[this.fastaContent.content[i].unique_id].accept = !!this.filterChoice.pattern.test(this.fastaContent.content[i].metadata.original.sequence.slice(this.fastaContent.content[i].metadata.originalStart, this.fastaContent.content[i].metadata.originalEnd + this.filterChoice.offset));
              if (!this.digestMap[this.fastaContent.content[i].unique_id].accept) {
                this.acceptTrack--;
              }
            } else {
              this.digestMap[this.fastaContent.content[i].unique_id].accept = !!this.filterChoice.pattern.test(this.fastaContent.content[i].sequence);
              if (!this.digestMap[this.fastaContent.content[i].unique_id].accept) {
                this.acceptTrack --;
              }
            }
          } else {
            this.digestMap[this.fastaContent.content[i].unique_id].accept = !!this.filterChoice.pattern.test(this.fastaContent.content[i].sequence);
            if (!this.digestMap[this.fastaContent.content[i].unique_id].accept) {
              this.acceptTrack --;
            }
          }
        }
      }
    }
  }

  changeAccept(id) {
    if (this.digestMap[id].accept) {
      this.acceptTrack ++;
    } else {
      this.acceptTrack --;
    }
  }

  UpdateRT(e: number[]) {
    this.rt = e;
    console.log(e);
  }
}
