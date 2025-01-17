import { Component, OnInit, Inject} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm, FormArray , FormControl} from "@angular/forms";
import { GimnasioService } from 'src/app/service/gimnasio.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { FranquiciaService } from 'src/app/service/franquicia.service';
//import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateMatcher} from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-sucursal-editar',
  templateUrl: './sucursal-editar.component.html',
  styleUrls: ['./sucursal-editar.component.css']
})
export class SucursalEditarComponent implements OnInit {

  formularioSucursales: FormGroup;
  gimnasio: any;
  franquicia: any;
  message: string = '';
  idGimnasio: any;

  constructor(
    //public dialogo: MatDialogRef<SucursalEditarComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: any,
    private formulario: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private gimnasioService: GimnasioService,
    public dialog: MatDialog,
    private franquiciaService: FranquiciaService,
  ) {
  
    //this.idGimnasio = data.idGimnasio;
   
    this.formularioSucursales = this.formulario.group({
     nombreGym: ["", Validators.required],
     codigoPostal: ["", Validators.required],
      estado: ["", Validators.required],
      ciudad: ["", Validators.required],
      colonia: ["", Validators.required],
      calle: ["", Validators.required],
      numExt: ["", Validators.required],
      numInt: [""],
      telefono:  ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      tipo: ["", Validators.required],
      Franquicia_idFranquicia: ["", Validators.required],
      casilleros: ["", Validators.required],
      estacionamiento: ["", Validators.required],
      regaderas: ["", Validators.required],
      bicicletero: ["", Validators.required],
      
    });
  }

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {
    this.franquiciaService.obternerFran().subscribe((respuesta) => {
      console.log(respuesta);
      if (Array.isArray(respuesta)) {
        this.franquicia = respuesta.map((dato) => ({
          value: dato.idFranquicia, // Valor que se enviará al seleccionar
          label: dato.nombre, // Etiqueta que se mostrará en el combo
        }));
      } else {
        console.error('La respuesta no es un arreglo.');
      }
    });
    

    this.gimnasioService.consultarPlan(this.idGimnasio).subscribe(
      (respuesta) => {
        this.formularioSucursales.setValue({
          nombreGym: respuesta[0]['nombreGym'],
          estado: respuesta[0]['estado'],
          ciudad: respuesta[0]['ciudad'],
          colonia: respuesta[0]['colonia'],
          calle: respuesta[0]['calle'],
          codigoPostal: respuesta[0]['codigoPostal'],
          numExt: respuesta[0]['numExt'],
          numInt: respuesta[0]['numInt'],
          telefono: respuesta[0]['telefono'],
          tipo: respuesta[0]['tipo'],
          Franquicia_idFranquicia: respuesta[0]['Franquicia_idFranquicia'],
          casilleros: respuesta[0]['casilleros'],
          estacionamiento: respuesta[0]['estacionamiento'],
          regaderas: respuesta[0]['regaderas'],
          bicicletero: respuesta[0]['bicicletero']
        }); 
      }
    );
  }

  actualizar() {
    console.log(this.formularioSucursales.value);
    this.gimnasioService.actualizarPlan(this.idGimnasio, this.formularioSucursales.value).subscribe(() => {
      this.dialog.open(MensajeEmergentesComponent, {
        data: 'Membresía actualizada exitosamente',
      })
        .afterClosed()
        .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
            this.router.navigateByUrl("/admin/lista-sucursales");
          } else {
          }
        });
    });
  }

  cerrarDialogo(): void {
    //this.dialogo.close(true);
  }
}




