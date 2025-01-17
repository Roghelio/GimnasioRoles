import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class notificaciones {
 
  API: string ='https://olympus.arvispace.com/gimnasioRoles/configuracion/EnviarMail/enviarNotificacion.php';
  APITra: string ='https://olympus.arvispace.com/gimnasioRoles/configuracion/EnviarMail/enviarNotificacionTrabajador.php';
  
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {}

  /**
   * Metodo para enviar mail con link de reset password
   * @param email
   * @returns
   */
  enviarMail(nombre: string, texto: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('texto', texto);
    formData.append('archivo', archivo);
    return this.clienteHttp.post(this.API, formData);
  }

  enviarMailTrabajadores(nombre: string, texto: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('texto', texto);
    formData.append('archivo', archivo);
    return this.clienteHttp.post(this.APITra, formData);
  }
}