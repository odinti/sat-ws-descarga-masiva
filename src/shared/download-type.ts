import { BaseEnum } from './enum/base-enum';

type DownloadTypeTypes = 'issued' | 'received';

enum DownloadTypeEnum {
    issued = 'RfcEmisor',
    received = 'RfcReceptor'
}

export class DownloadType extends BaseEnum<DownloadTypeTypes> {
    public value(): string {
        return DownloadTypeEnum[this._id];
    }
}
