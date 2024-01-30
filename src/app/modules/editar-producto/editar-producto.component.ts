
import { Component, OnInit, Inject, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api'; /**siempre debes importarlo */
//import { ToastrService } from 'ngx-toastr';
//import { ColaboradorService } from 'src/app/service/colaborador.service';
import { ProductosService } from 'src/app/service/productos.service';

import { MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { CategoriaService } from 'src/app/service/categoria.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, MessageService],
})
export class EditarProductoComponent implements OnInit{
  form: FormGroup;
  gimnasio: any;
  message: string = '';
  producto: any;
  idCategoria: number = 0;
  listaCategorias: any;
  idProducto: any;
  fechaCreacion: string;

  constructor( public dialogo: MatDialogRef<EditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb:FormBuilder,
    private activeRoute: ActivatedRoute, 
    private productoService:ProductosService,
    private datePipe: DatePipe,
    private router:Router,
    public dialog: MatDialog,
    private categoriaService: CategoriaService,){

    this.idProducto = data.idProducto;
    console.log(this.idProducto, "this.idProducto");
    //llamar al servicio datos empleado - pasando el parametro capturado por url
    this.productoService.consultarProductosJ(this.idProducto).subscribe(
      respuesta=>{
        //asignar valor a los campos correspondientes al fomulario
        console.log(respuesta, "respuesta");
        this.form.setValue({
          nombre:respuesta [0]['nombre'],
          descripcion:respuesta [0]['descripcion'],
          codigoBarra:respuesta [0]['codigoBarra'],
          idCategoria:respuesta [0]['Categoria_idCategoria'],
          fechaCreacion:respuesta [0]['fechaCreacion'],
          unidadMedicion:respuesta [0]['unidadMedicion'],
          cantidadUnidades:respuesta [0]['cantidadUnidades'],
          color:respuesta [0]['color'],
          longitud:respuesta [0]['longitud'],
          sabor:respuesta [0]['sabor'],
          marca:respuesta [0]['marca'],
        });
      }
      
    );

    this.fechaCreacion = this.obtenerFechaActual();
   
    this.form = this.fb.group({
      nombre: [ '',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),]),],
      descripcion: ['', Validators.required],
      fechaCreacion: [this.fechaCreacion],
      codigoBarra: [''],
      idCategoria: ['', Validators.compose([Validators.required])],
      unidadMedicion: ['NA', Validators.compose([Validators.required])],
      cantidadUnidades: [0,Validators.compose([Validators.required,Validators.pattern(/^[0-9]+$/)])],
      color: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      longitud: ['NA'],
      sabor: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      marca: ['',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])]
    });
  }

  //insanciar objeto para manejar el tipo de error en las validaciones
  matcher = new MyErrorStateMatcher();

  //mandar a llamar el sevicio correspondiente al llenado del combo sucursal
  ngOnInit(): void {
    this.categoriaService.obternerCategoria().subscribe({
      next: (respuesta) => {
        this.listaCategorias = respuesta;
        console.log('lista de categorias:', this.listaCategorias);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  cancelar() {
    this.router.navigateByUrl('/admin/gestion-productos');
  }

  actualizar(){
    this.productoService.actualizarProducto(this.idProducto,this.form.value).subscribe(
      (response) => {
        console.log('Producto actualizado correctamente:', response);
        this.dialog.open(MensajeEmergentesComponent, {
          data: `Producto actualizado exitosamente`,
        })
        .afterClosed()
        .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
            this.router.navigateByUrl("/admin/gestion-productos");
          } else {
            
          }
        });
      },
      (error) => {
        console.error('Error al actualizar producto:', error);
        // Manejo de errores
      }
    );
}

infoCategoria(event: number) {
  console.log('Opción seleccionada:', event);
  this.idCategoria = event;
  console.log('valor idCategoria:', this.idCategoria);
}

cerrarDialogo(): void {
  this.dialogo.close(true);
}

}
