import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FingerprintReader,
  SampleFormat,
  DeviceConnected,
  DeviceDisconnected,
  SamplesAcquired,
  AcquisitionStarted,
  AcquisitionStopped,
  QualityReported
} from '@digitalpersona/devices';
import "./../../WebSdk";

@Component({
  selector: 'app-reader-finger',
  templateUrl: './reader-finger.component.html',
  styleUrls: ['./reader-finger.component.css']
})
export class ReaderFingerComponent implements OnInit, OnDestroy {

  // Variables para manejar la lectura, informacion del dispositivo, almacenamiento e imagen de la huella
  private reader: FingerprintReader;
  ListaFingerPrintReader: any;
  InfoFingerPrintReader: any;
  ListaSamplesFingerPrints: any;
  currentImageFinger: any;
  currentImageFingerFixed: any;

  constructor() {
    this.reader = new FingerprintReader();
  }

  // Event handlers.
  private onDeviceConnected = (event: DeviceConnected) => { }
  private onDeviceDisconnected = (event: DeviceDisconnected) => { };
  private onQualityReported = (event: QualityReported) => { };
  private onAcquisitionStarted = (event: AcquisitionStarted) => {
    console.log("En evento: onAcquisitionStarted");
    console.log(event);
  };
  private onAcquisitionStopped = (event: AcquisitionStopped) => {
    console.log("En evento: onAcquisitionStopped");
    console.log(event);
  };
  private onSamplesAcquired = (event: SamplesAcquired) => {
    console.log("En el evento: Adquisición de imagen");
    console.log(event);
    this.ListaSamplesFingerPrints = event;
  };

  ngOnDestroy(): void {
    this.reader.off("DeviceConnected", this.onDeviceConnected);
    this.reader.off("DeviceDisconnected", this.onDeviceDisconnected);
    this.reader.off("AcquisitionStopped", this.onAcquisitionStopped);
    this.reader.off("SamplesAcquired", this.onSamplesAcquired);
    this.reader.off("AcquisitionStarted", this.onAcquisitionStarted);
  }
  ngOnInit(): void {
    this.reader = new FingerprintReader();
    this.reader.on("DeviceConnected", this.onDeviceConnected);
    this.reader.on("DeviceDisconnected", this.onDeviceDisconnected);
    this.reader.on("AcquisitionStopped", this.onAcquisitionStopped);
    this.reader.on("SamplesAcquired", this.onSamplesAcquired);
    this.reader.on("AcquisitionStarted", this.onAcquisitionStarted);
  }

  // Listar dispositivos conectados
  fn_Listar_Dispositivos(){
    Promise.all([
      this.reader.enumerateDevices()
    ])
    .then(results => {
      this.ListaFingerPrintReader = results[0];
      console.log("Dato dispositivos");
      console.log(this.ListaFingerPrintReader);
    })
    .catch((error) => {
      console.log(error);
    })
  }

  // Informacion del dispositivo...
  fn_DeviceInfo(){
    Promise.all([
      this.reader.getDeviceInfo(this.ListaFingerPrintReader[0])
    ])
    .then(results => {
      this.InfoFingerPrintReader = results[0];
      console.log("Info finger reader");
      console.log(this.InfoFingerPrintReader);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // Iniciar device para captura
  fn_StartCapturaFP(){
    this.reader.startAcquisition(SampleFormat.PngImage, this.InfoFingerPrintReader['DeviceID'])
    .then((response) => {
      console.log("You can start capturing!!!");
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // Detener la lectura
  fn_EndCaptureFP(){
    this.reader.stopAcquisition(this.InfoFingerPrintReader['DeviceID'])
    .then((response) => {
      console.log("You stopped the capture.");
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // Mostrar la huella en pantalla
  fn_CapturaFP(){
    var ListImages = this.ListaSamplesFingerPrints['samples'];
    var lsize = Object.keys(ListImages).length;
    if(ListImages != null && ListImages != undefined){
      if(lsize > 0){
        this.currentImageFinger = ListImages[0];
        this.currentImageFingerFixed = this.fn_fixFormatImageBase64(this.currentImageFinger);
      }
    }
  }

  // Corregir formato base64
  fn_fixFormatImageBase64(prm_imageBase: any){
    var strImage = '';
    strImage = prm_imageBase;

    // Reemplazar caracteres no validos
    strImage = strImage.replace(/_/g, "/");
    strImage = strImage.replace(/-/g,"+");

    return strImage;
  }
    
}
