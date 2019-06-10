import csv
from pyteomics import parser, mass
import itertools
import re
import copy
from tornado import web, gen, ioloop, escape
from tornado.options import define, options

define("p", default="9000", help="Backend Listening Port")


def prepare_libraries(sequence, **kwargs):
    kw = ("static", "variable", "Ytype")
    ignore = {"FALSE", ""}
    labels = parser.std_labels[:]
    mod_mass = dict(mass.std_aa_mass)

    for k in kw:
        if k in kwargs:
            for m in range(len(kwargs[k])):
                labels.append(kwargs[k][m]["label"])
                mod_mass[kwargs[k][m]["label"]] = kwargs[k][m]["mass"]
                if kwargs[k][m]["auto_allocation"] not in ignore:

                    reg = re.compile(kwargs[k][m]["regex"])

                    if "positions" not in kwargs[k][m]:
                        kwargs[k][m]["positions"] = []

                    for match in reg.finditer(sequence):
                        kwargs[k][m]["positions"].append(match.start())

    return labels, mod_mass, parser.parse(sequence, labels=labels, split=True)


def generate_fragments(parsed_seq, **kwargs):
    if "static" in kwargs:
        for m in range(len(kwargs["static"])):
            if len(kwargs["static"][m]["positions"]) > 0:
                for position in kwargs["static"][m]["positions"]:
                    parsed_seq[position] = (kwargs["static"][m]["label"],) + parsed_seq[position]
    if "variable" in kwargs:
        if len(kwargs["variable"]) > 0:
            for i in _generate_permutation(mods_variable=kwargs["variable"]):
                yield make_modded_sequence(parsed_seq[:], i, kwargs["variable"])
        else:
            yield parsed_seq
    else:
        yield parsed_seq


def _generate_permutation(mods_variable):
    permutation_mods = []
    for m in range(len(mods_variable)):
        if "positions" in mods_variable[m]:
            if len(mods_variable[m]["positions"]) > 0:
                composite = list()
                l = len(mods_variable[m]["positions"])
                mod_amount = 1
                if "status" in mods_variable[m]:
                    if mods_variable[m]["status"]:
                        mod_amount = l
                if mods_variable[m]["Ytype"] != "":
                    com = []
                    for i in range(l - mod_amount):
                        com.append(("x",))
                    for i in range(mod_amount):
                        com.append((mods_variable[m]["label"], "x"))
                    if l > 1:
                        composite = list(itertools.combinations(
                            com, l))
                    else:
                        # composite = list(itertools.combinations(
                        #    [("x",), (mods_variable[m]["label"], "x")], 1))
                        composite = [((mods_variable[m]["label"], 'x'),)]

                else:
                    if mods_variable[m]["status"]:
                        com = []
                        for i in range(mod_amount):
                            com.append((mods_variable[m]["label"], "x"))
                        composite = list(itertools.combinations(com, l))
                        com = []
                        for i in range(mod_amount):
                            com.append(("x",))
                        composite += list(itertools.combinations(com, l))
                    else:
                        composite = list(itertools.combinations_with_replacement(
                            [("x",), (mods_variable[m]["label"], "x")],
                            len(mods_variable[m]["positions"])))
                print(composite)
                if "permutations" not in mods_variable[m]:
                    mods_variable[m]["permutations"] = set()
                    if mods_variable[m]["multiple_pattern"]:
                        for comp in composite:
                            for i in itertools.permutations(comp):
                                mods_variable[m]["permutations"].add(i)
                                print(mods_variable[m]["permutations"])
                    else:
                        mods_variable[m]["permutations"] = set(composite)
                print(mods_variable[m]["permutations"])
                permutation_mods.append(m)

    for m in range(len(permutation_mods)):
        if (m + 1) < len(permutation_mods):
            mods_variable[permutation_mods[m]]["tree"] = Tree(permutation_mods[m], [permutation_mods[m + 1]] * len(
                mods_variable[m]["permutations"]))
        else:
            mods_variable[permutation_mods[m]]["tree"] = Tree(permutation_mods[m], end=True)

    return explore(mods_variable[permutation_mods[0]]["tree"], mods_variable)


def make_modded_sequence(parsed_seq, mod_lib, mods_variable):
    seq = parsed_seq[:]
    print(seq)
    for k in mod_lib:
        print(mod_lib[k])
        if isinstance(mod_lib[k][0], tuple):
            for mod, position in zip(mod_lib[k], mods_variable[k]["positions"]):
                if len(mod) > 1:
                    seq[position] = (mod[0],) + seq[position]

        else:
            for mod, position in zip(mod_lib[k], mods_variable[k]["positions"]):
                if len(mod) > 1:
                    seq[position] = (mod[0],) + seq[position]

    return seq


class Tree:
    def __init__(self, modification=None, branches=None, end=False):
        self.modification = modification
        self.branches = branches
        self.end = end


def explore(tree, mods_variable, mod=None):
    if mod is None:
        mod = dict()
    if tree.end:
        for m in mods_variable[tree.modification]["permutations"]:
            mod[tree.modification] = m
            yield mod
    else:
        for p, b in zip(mods_variable[tree.modification]["permutations"], tree.branches):
            mod[tree.modification] = p
            yield from explore(mods_variable[b]["tree"], mods_variable, mod)


def read_mod_input(path: str) -> dict:
    mods = {}
    with open(path, 'rt') as infile:
        reader = csv.DictReader(infile, delimiter='\t')
        for i in reader:
            if i["type"] not in mods:
                mods[i["type"]] = []
            mods[i["type"]].append(
                dict(label=i["label"], regex=i["regex"], mass=float(i["mass"]), auto_allocation=i["auto_allocation"],
                     Ytype=i["Ytype"], multiple_pattern=i["multiple_pattern"], name=i["name"], status=i["status"])
            )
    return mods


def read_seq_input(path):
    with open(path, 'rt') as infile:
        reader = csv.DictReader(infile, delimiter='\t')
        for i in reader:
            yield i


def read_windows(path):
    with open(path, 'rt') as infile:
        reader = csv.DictReader(infile, dialect="excel-tab")

        return [(int(i["start"]) + int(i["end"])) / 2 for i in reader]


def fragments_by(aa_mass, ion_maxcharge, ion_type, labels, seq_len, temp, variable_mods, Ytype=None, y_stop_at=-1,
                 b_stop_at=-1, by_static=False, b_selected=None, y_selected=None):
    if b_selected is None:
        b_selected = []
    if y_selected is None:
        y_selected = []
    if Ytype:
        yield from generate_Yion(Ytype, aa_mass, ion_maxcharge, ion_type, labels, temp)
    mass_dict = dict(aa_mass)
    if by_static:
        for i in variable_mods:
            if i["type"] == 'Ytype':
                if i["label"] in mass_dict:
                    mass_dict[i["label"]] = 0

    if "b" in ion_type or "y" in ion_type:
        yield from generate_byion(mass_dict, b_stop_at, ion_maxcharge, ion_type, labels, seq_len, temp, y_stop_at, b_selected, y_selected)


def generate_byion(aa_mass, b_stop_at, ion_maxcharge, ion_type, labels, seq_len, temp, y_stop_at, b_selected, y_selected):
    for s in range(seq_len):
        if not (s + 1) == 1:
            for m in range(ion_maxcharge):
                for ion in ion_type:
                    if ion == "y":
                        position = seq_len - s - 1
                        if y_stop_at > -1:
                            if position <= y_stop_at:
                                continue
                        if y_selected:
                            if position in y_selected:
                                seq = temp[position:]
                                str_seq = parser.tostring(seq, False)
                                # print(str_seq)
                                yield Ion(seq=temp, ion_type=ion, charge=m + 1,
                                          mz=mass.fast_mass2(str_seq, ion_type=ion, charge=m + 1, aa_mass=aa_mass,
                                                             labels=labels), fragment_number=s + 1)
                        else:
                            seq = temp[position:]
                            str_seq = parser.tostring(seq, False)
                            # print(str_seq)
                            yield Ion(seq=temp, ion_type=ion, charge=m + 1,
                                      mz=mass.fast_mass2(str_seq, ion_type=ion, charge=m + 1, aa_mass=aa_mass,
                                                         labels=labels), fragment_number=s + 1)
                    elif ion == "b":
                        position = s + 1
                        if position == seq_len:
                            continue
                        if b_stop_at > -1:
                            if position > b_stop_at:
                                continue
                        if b_selected:
                            if s in b_selected:
                                seq = temp[:position]
                                str_seq = parser.tostring(seq, False)
                                # print(str_seq)
                                yield Ion(seq=temp, ion_type=ion, charge=m + 1,
                                          mz=mass.fast_mass2(str_seq, ion_type=ion, charge=m + 1, aa_mass=aa_mass,
                                                             labels=labels), fragment_number=s + 1)
                        else:
                            seq = temp[:position]
                            str_seq = parser.tostring(seq, False)
                            # print(str_seq)
                            yield Ion(seq=temp, ion_type=ion, charge=m + 1,
                                      mz=mass.fast_mass2(str_seq, ion_type=ion, charge=m + 1, aa_mass=aa_mass,
                                                         labels=labels), fragment_number=s + 1)


def generate_Yion(Ytype, aa_mass, ion_maxcharge, ion_type, labels, temp):
    str_seq = parser.tostring(temp, False)
    for m in range(ion_maxcharge):
        if "Y" in ion_type:
            yield Ion(seq=temp, charge=m + 1, ion_type="Y",
                      mz=mass.fast_mass2(str_seq, charge=m + 1, aa_mass=aa_mass, labels=labels),
                      fragment_number=int(Ytype[1:]) + 1)


def fragmenting(i, rec, ms, mv, query_unique, protein_id, unique_q3=None, y=None):
    labels, aa_mass, seq = prepare_libraries(i['_protein']['_sequence'], static=ms, variable=mv)
    seq_len = len(seq)
    result = []
    msMap = {m['label']: m['m_label'] for m in ms}

    for f in generate_fragments(seq[:], static=ms, variable=mv):
        # print(f)
        new_seq = parser.tostring(f, False)
        print('Current: ' + new_seq)
        precursor_mz = mass.fast_mass2(new_seq, charge=i['_precursor_charge'], aa_mass=aa_mass, labels=labels)
        variable = ''

        for r in i['_rt']:
            for ion in fragments_by(aa_mass, i['_charge'], i['_protein']['_ion_type'], labels, seq_len, f, mv, Ytype=y,
                                    b_stop_at=i['_b_stop_at'], y_stop_at=i['_y_stop_at'], by_static=i['_by_run'], b_selected=i['_b_selected'], y_selected=i['_y_selected']):
                create_row(f, i, ion, msMap, mv, precursor_mz, query_unique, r, rec, result, seq, seq_len, unique_q3,
                           variable, protein_id)

    return result, query_unique


def create_row(f, i, ion, msMap, mv, precursor_mz, query_unique, r, rec, result, seq, seq_len, unique_q3, variable, protein_id):
    if 50 <= ion.mz <= 1800:
        if i['_windows']:
            for window in i['_windows']:
                p = ['start', 'stop']
                if '_start' in window:
                    p[0] = '_start'
                    p[1] = '_stop'
                w = (window[p[0]] + window[p[1]]) / 2
                precursor_seq = ""
                if i['_variable_format'] == 'rt':
                    variable = str(int(r))
                elif i['_variable_format'] == 'windows+rt':
                    variable = str(int(r)) + '.' + str(int(w))
                elif i['_variable_format'] == 'windows':
                    variable = str(int(w))
                conflict_labels = set()
                for aa in range(seq_len):
                    if len(f[aa]) > 1:
                        # precursor_seq += seq[aa][0] + "[" + str(
                        #     int(aa_mass[f[aa][0]])) + "." + str(
                        #     int(w)) + "]"
                        if f[aa][0] in msMap:
                            precursor_seq += seq[aa][0] + "[" + msMap[f[aa][0]] + "]"
                        else:
                            if aa in rec:
                                cl = "[" + ('%.4f' % rec[aa]["mass"]) + "]"
                                precursor_seq += seq[aa][0] + cl
                                conflict_labels.add(cl)
                            else:
                                precursor_seq += seq[aa][0] + "[" + variable + "]"
                    else:
                        precursor_seq += seq[aa][0]

                if len(mv) == 0:

                    precursor_seq += "[" + variable + "]"
                else:
                    rem_conflict = precursor_seq[:]
                    if len(conflict_labels) > 0:
                        for cl in conflict_labels:
                            rem_conflict = rem_conflict.replace(cl, "")
                    if rem_conflict == i['_protein']["_sequence"]:
                        precursor_seq += "[" + variable + "]"
                if unique_q3 is not None:
                    pattern = (tuple(f), precursor_seq, r, w)
                    unique_q3.add(pattern)
                row = (w, '%.4f' % ion.mz, str(r), protein_id, "", 1, i['_protein']["_sequence"],
                       precursor_seq, 2, ion.ion_type, ion.charge,
                       ion.fragment_number, str(r), protein_id, 0, 'FALSE', 0, 0.99, 'FALSE', 1,
                       '', '', '',
                       '',)
                # print(row[7])
                unique = (row[0], row[1], row[2], row[3],
                          row[6],
                          row[7],
                          # row[8],row[9],
                          )
                if unique not in query_unique:
                    query_unique.add(unique)
                    result.append({'row': row})
        else:
            precursor_seq = ""
            conflict_labels = set()
            if i['_variable_format'] == 'rt':
                variable = str(int(r))
            elif i['_variable_format'] == 'windows+rt':
                variable = str(int(r)) + '.' + str(int(precursor_mz))
            elif i['_variable_format'] == 'windows':
                variable = str(int(precursor_mz))
            for aa in range(seq_len):
                if len(f[aa]) > 1:
                    # if i['_variable_format'] == 'rt':
                    #     variable = str(int(r))
                    # elif i['_variable_format'] == 'windows+rt':
                    #     variable = str(int(r)) + '.' + str(int(precursor_mz))
                    # elif i['_variable_format'] == 'windows':
                    #     variable = str(int(precursor_mz))
                    if f[aa][0] in msMap:
                        precursor_seq += seq[aa][0] + "[" + msMap[f[aa][0]] + "]"
                    else:
                        if aa in rec:
                            cl = '%.4f' % rec[aa]["mass"]
                            precursor_seq += seq[aa][0] + "[" + cl + "]"
                            conflict_labels.add(cl)
                        else:

                            precursor_seq += seq[aa][0] + "[" + variable + "]"
                else:
                    precursor_seq += seq[aa][0]
            if len(mv) == 0:
                precursor_seq += "[" + variable + "]"
            else:
                rem_conflict = precursor_seq[:]
                if len(conflict_labels) > 0:
                    for cl in conflict_labels:
                        rem_conflict = rem_conflict.replace(cl, "")
                if rem_conflict == i['_protein']["_sequence"]:
                    precursor_seq += "[" + variable + "]"
            if unique_q3 is not None:
                pattern = (tuple(f), precursor_seq, r, '%.2f' % precursor_mz,)
                unique_q3.add(pattern)
            row = ('%.2f' % precursor_mz, '%.4f' % ion.mz, str(r), protein_id, "", 1,
                   i['_protein']["_sequence"], precursor_seq, 2, ion.ion_type, ion.charge,
                   ion.fragment_number, str(r), protein_id, 0, 'FALSE', 0, 0.99, 'FALSE', 1,
                   '',
                   '', '', '')
            unique = (row[0], row[1], row[2], row[3], row[6], row[7],
                      # row[8], row[9],
                      )
            # print(row[7])
            if unique not in query_unique:
                query_unique.add(unique)
                result.append({'row': row})


def recursive_resolve_conflict(conflict, result=None):
    if result is None:
        result = dict()
    if len(conflict) > 0:
        for i in range(len(conflict)):
            for i2 in conflict[i]["_mods"]:
                result[conflict[i]["_coordinate"]] = i2
                if i + 1 < len(conflict):
                    yield from recursive_resolve_conflict(conflict[i + 1:], result)
                else:
                    yield result
    else:
        yield result


class Ion:
    def __init__(self, **kwargs):
        self.ion_type = ""
        self.charge = 0
        self.seq = ""
        self.fragment_number = 1
        for i in kwargs:
            setattr(self, i, kwargs[i])


class BaseHandler(web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT')

    def options(self):
        self.set_status(204)
        self.finish()


class SwathLibHandler(BaseHandler):
    def get(self, *args, **kwargs):
        print(self.request)

    @gen.coroutine
    def put(self, *args, **kwargs):
        result = [dict(row=columns)]
        data = escape.json_decode(self.request.body)
        query_unique = set()
        print(data)

        protein_id = data['_protein']['_id']
        if not data['_protein']['original'] and data['_protein']['_metadata']['original']['_id']:
            protein_id = data['_protein']['_metadata']['original']['_id']

        if len(data['_modifications']) > 0:
            run_result, query_unique, modifications = self.run(data, dict(static=[], variable=[], Ytype=[]),
                                                               query_unique, ignore=[], protein_id=protein_id)
            result += run_result
        else:
            if not data['_oxonium_only']:
                run_result, query_unique, modifications = self.run(data, dict(static=[], variable=[], Ytype=[]),
                                                                   query_unique, ignore=[], protein_id=protein_id)
                result += run_result
            if '_oxonium' in data and data['_oxonium_only']:
                for r in data['_rt']:
                    for window in data['_windows']:
                        p = ['start', 'stop']
                        if '_start' in window:
                            p[0] = '_start'
                            p[1] = '_stop'
                        w = (window[p[0]] + window[p[1]]) / 2
                        fragnum = 1
                        ion = 'b'
                        for o in data['_oxonium']:
                            result.append(
                                {'row': [w, '%.4f' % o['mz'], str(r), protein_id, "", 1,
                                         data['_protein']["_sequence"],
                                         data['_protein']["_sequence"] + "[" + str(int(r)) + "." + str(int(w)) + "]", 2,
                                         ion, fragnum, '1'
                                    , str(r), protein_id, 0, 'FALSE', 0, 0.99,
                                         'FALSE',
                                         1, '',
                                         '', '', '']})
                            fragnum += 1
        # if data['_by_run']:
        #     data['_protein']['_ion_type'] = 'by'
        #     ms = copy.deepcopy(modifications['static'])
        #     tempresult, query_unique = fragmenting(data, {}, ms, [], query_unique)
        #     result += tempresult
        print("Finished. " + data['_protein']['_sequence'] + ' ' + str(len(result)))
        self.write(dict(data=result))

    def run(self, data, modifications, query_unique, ignore, protein_id):
        run_result = []
        for i in data['_modifications']:
            if i['type'] not in modifications:
                modifications[i['type']] = []
            if i['type'] not in ignore:
                modifications[i['type']].append(i)
        if not data['_rt']:
            data['_rt'] = [10]
        print(modifications)
        for rec in recursive_resolve_conflict(data["_conflict"]):
            print(rec)
            comod = modifications['variable'][:]
            if len(rec) > 0:
                for r in rec:
                    for m in range(len(comod)):
                        comod[m] = dict(comod[m])
                        if "positions" in comod[m]:
                            if r in comod[m]["positions"]:
                                if rec[r]["name"] != comod[m]["name"]:
                                    comod[m]["positions"] = [e for e in comod[m]["positions"] if e != r]
                            else:
                                if rec[r]["name"] == comod[m]["name"]:
                                    comod[m]["positions"].append(r)
            processed = []
            for m in comod:
                if len(m["positions"]) > 0:
                    processed.append(m)
            if modifications['Ytype']:
                unique_q3 = dict()
                maxY = dict()
                for y in modifications['Ytype']:
                    if y['name'] not in unique_q3:
                        unique_q3[y['name']] = set()
                    if y['name'] not in maxY:
                        maxY[y['name']] = 0
                    if int(y['Ytype'][1:]) > maxY[y['name']]:
                        maxY[y['name']] = int(y['Ytype'][1:])
                    ms = copy.deepcopy(modifications['static'])
                    mv = processed[:]
                    mv.append(dict(y))
                    tempresult, query_unique = fragmenting(data, rec, ms, mv, query_unique, protein_id, unique_q3[y['name']],
                                                           y['Ytype'])
                    if not data['_oxonium_only']:
                        run_result += tempresult

                # print(unique_q3)
                if '_oxonium' in data:
                    for k in unique_q3:
                        for i in unique_q3[k]:
                            fragnum = maxY[k] + 1
                            ion = 'Y'
                            # fragnum = int(data['_charge'])
                            if 'b' not in data['_modifications']:
                                fragnum = 1
                                ion = 'b'
                            for o in data['_oxonium']:
                                run_result.append(
                                    {'row': [i[3], '%.4f' % o['mz'], str(i[2]), protein_id, "", 1,
                                             data['_protein']["_sequence"], i[1], 2, ion, fragnum, '1'
                                        , str(i[2]), protein_id, 0, 'FALSE', 0, 0.99,
                                             'FALSE',
                                             1, '',
                                             '', '', '']})
                                fragnum += 1

            else:
                ms = copy.deepcopy(modifications['static'])
                mv = processed[:]
                tempresult, query_unique = fragmenting(data, rec, ms, mv, query_unique, protein_id)
                run_result += tempresult
        return run_result, query_unique, modifications


columns = ['Q1', 'Q3', 'RT_detected', 'protein_name', 'isotype', 'relative_intensity', 'stripped_sequence',
           'modification_sequence', 'prec_z', 'frg_type', 'frg_z', 'frg_nr', 'iRT', 'uniprot_id', 'score', 'decoy',
           'prec_y',
           'confidence', 'shared', 'N', 'rank', 'mods', 'nterm', 'cterm']

settings = {
    "autoreload": True,
    "debug": True,
}

if __name__ == "__main__":
    application = web.Application([
        (r"/api/swathlib/upload/", SwathLibHandler),
    ], **settings)
    application.listen(options.p)
    print("Currently running at http://localhost:" + str(options.p))
    print("Keep this window open and copy the address to use as server connection.")
    ioloop.IOLoop.current().start()

