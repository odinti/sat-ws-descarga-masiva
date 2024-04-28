import { CfdiFileFilter } from './internal/file-filters/cfdi-file-filter.js';
import { FilteredPackageReader } from './internal/filtered-package-reader.js';
import { type PackageReaderInterface } from './package-reader-interface.js';

export class CfdiPackageReader implements PackageReaderInterface {
  constructor(private readonly _packageReader: PackageReaderInterface) {}

  public static async createFromFile(filename: string): Promise<CfdiPackageReader> {
    const packageReader = await FilteredPackageReader.createFromFile(filename);
    packageReader.setFilter(new CfdiFileFilter());

    return new CfdiPackageReader(packageReader);
  }

  public static async createFromContents(contents: string): Promise<CfdiPackageReader> {
    const packageReader = await FilteredPackageReader.createFromContents(contents);
    packageReader.setFilter(new CfdiFileFilter());
    // delete temporary file
    await packageReader.destruct();

    return new CfdiPackageReader(packageReader);
  }

  public async *cfdis(): AsyncGenerator<Map<string, string>> {
    for await (const content of this._packageReader.fileContents()) {
      let data = '';
      for (const item of content) {
        data = item[1];
      }

      yield new Map().set(CfdiFileFilter.obtainUuidFromXmlCfdi(data), data);
    }
  }

  public getFilename(): string {
    return this._packageReader.getFilename();
  }

  public async count(): Promise<number> {
    let count = 0;

    for await (const [,] of this.fileContents()) {
      count++;
    }

    return count;
  }

  public async *fileContents(): AsyncGenerator<Map<string, string>> {
    yield* this._packageReader.fileContents();
  }

  public async jsonSerialize(): Promise<{
    source: string;
    files: Record<string, string>;
    cfdis: Record<string, string>;
  }> {
    const filtered = await (this._packageReader as FilteredPackageReader).jsonSerialize();
    let cfdis: Record<string, string> = {};
    for await (const item of this.cfdis()) {
      for (const [key, value] of item) {
        cfdis = { ...cfdis, [key]: value };
      }
    }

    return {
      source: filtered.source,
      files: filtered.files,
      cfdis,
    };
  }

  public async cfdisToArray(): Promise<Array<{ uuid: string; content: string }>> {
    const cfdis: Array<{ uuid: string; content: string }> = [];
    for await (const item of this.cfdis()) {
      for (const [uuid, content] of item) {
        cfdis.push({ uuid, content });
      }
    }

    return cfdis;
  }

  public async fileContentsToArray(): Promise<Array<{ name: string; content: string }>> {
    const contents: Array<{ name: string; content: string }> = [];
    for await (const item of this.fileContents()) {
      for (const [name, content] of item) {
        contents.push({ name, content });
      }
    }

    return contents;
  }
}
