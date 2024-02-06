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
import "../../WebSdk";

@Component({
  selector: 'app-auth-finger',
  templateUrl: './auth-finger.component.html',
  styleUrls: ['./auth-finger.component.css']
})
export class AuthFingerComponent implements OnInit, OnDestroy {
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

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }


}
