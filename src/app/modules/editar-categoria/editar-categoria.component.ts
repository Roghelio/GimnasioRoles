import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CategoriaService } from 'src/app/service/categoria.service';
import { MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-editar-categoria',
  templateUrl: './editar-categoria.component.html',
  styleUrls: ['./editar-categoria.component.css']
})
export class EditarCategoriaComponent {
  formularioCategoria: FormGroup;
  gimnasio: any;
  message: string = '';
  idCategoria: any;
  elID:any;
  matcher = new MyErrorStateMatcher();

  constructor(
    public dialogo: MatDialogRef<EditarCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formulario:FormBuilder,
    private activeRoute: ActivatedRoute, 
    private categoriaService:CategoriaService,
    private router:Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService){
    this.idCategoria = data.idCategoria; // Accede a idGimnasio desde los datos
   
    //llamar al servicio datos empleado - pasando el parametro capturado por url
    this.categoriaService.consultarCategoria(this.idCategoria).subscribe(
      respuesta=>{
        //asignar valor a los campos correspondientes al fomulario
        this.formularioCategoria.setValue({
          nombre:respuesta [0]['nombre'],
          descripcion:respuesta [0]['descripcion'],
          estatus:respuesta [0]['estatus'],
          fechaCreacion:respuesta [0]['fechaCreacion']
        });
      }
    );


    //asignar validaciones a los campos de fomulario
    this.formularioCategoria = this.formulario.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      estatus: ['', Validators.required],
      fechaCreacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {

  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  actualizar(){
    if (this.formularioCategoria.valid) {
      this.spinner.show();

    this.categoriaService.actualizarCategoria(this.idCategoria,this.formularioCategoria.value).subscribe(()=>{
      this.spinner.hide();
      this.dialog.open(MensajeEmergentesComponent, {
        data: `Categoria actualizada exitosamente`,

      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.dialogo.close(true);
        } else {
        }
      });
    });
  } else {
    // El formulario no es válido, muestra un mensaje de error
    this.message = 'Por favor, complete todos los campos requeridos.';
  }
}
}
