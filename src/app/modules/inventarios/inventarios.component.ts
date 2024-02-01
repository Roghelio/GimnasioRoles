import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/service/producto.service';
import { EmergenteHistorialProductosComponent } from '../emergente-historial-productos/emergente-historial-productos.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'inventarios',
  templateUrl: './inventarios.component.html',
  styleUrls: ['./inventarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventariosComponent implements OnInit {
  displayedColumns: string[] = [
    'Código De Barras',
    'Categoría',
    'Nombre',
    'Descripción',
    'Cantidad Disponible'
  ];

  listInventarioData: any[] = [];
  dataSource: any; // instancia para matTableDatasource

  //paginator es una variable de la clase MatPaginator
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private productoService: ProductoService, 
    private auth: AuthService,public dialog: MatDialog,private toastr: ToastrService,) {}

  ngOnInit(): void {
    this.productoService.obternerInventario(this.auth.idGym.getValue()).subscribe((respuesta) => {
      this.listInventarioData = respuesta;
      this.dataSource= new MatTableDataSource(this.listInventarioData);
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abrirHistorial(): void {
    this.dialog.open(EmergenteHistorialProductosComponent, {
      maxWidth: '100%',
      width: 'auto',
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {
        
      } else {
        
      }
    });
  }
}
