import {ConnectorUrl} from "./connector-url";
import {ChildProcess} from "child_process";

export class Backend {
    constructor(pythonPath: string, port: string, status: boolean, url: ConnectorUrl) {
        this.pythonPath = pythonPath;
        this.port = port;
        this.status = status;
        this.url = url;
    }
    pythonPath: string;
    port: string;
    status: boolean;
    url: ConnectorUrl;
    process: ChildProcess;
}
