export class ConnectorUrl {
  constructor(url: string, status: boolean) {
    this.url = url;
    this.status = status;
  }
  url: string;
  status: boolean;
}
