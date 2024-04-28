import { InteractsXmlTrait } from '../../internal/interacts-xml-trait.js';
import { type RequestBuilderInterface } from '../../request-builder/request-builder-interface.js';
import { StatusCode } from '../../shared/status-code.js';
import { DownloadResult } from './download-result.js';

export class DownloadTranslator extends InteractsXmlTrait {
  public createDownloadResultFromSoapResponse(content: string): DownloadResult {
    const env = this.readXmlElement(content);
    const values = this.findAtrributes(env, 'header', 'respuesta');

    const status = new StatusCode(Number(values.codestatus), values.mensaje);
    const cpackage = this.findContent(
      env,
      'body',
      'RespuestaDescargaMasivaTercerosSalida',
      'Paquete',
    );

    return new DownloadResult(status, Buffer.from(cpackage).toString() || '');
  }

  public createSoapRequest(requestBuilder: RequestBuilderInterface, packageId: string): string {
    return requestBuilder.download(packageId);
  }
}
