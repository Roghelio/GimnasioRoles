import { MatTableDataSource } from "@angular/material/table";
import { AuthService } from "src/app/service/auth.service";
import { JoinDetalleVentaService } from "src/app/service/JoinDetalleVenta";
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit  } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CajaService } from "src/app/service/caja.service";
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, Validators} from "@angular/forms";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VentasComponent } from "../ventas/ventas.component";
@Component({
  selector: 'app-ver-corte',
  templateUrl: './ver-corte.component.html',
  styleUrls: ['./ver-corte.component.css']
})
export class VerCorteComponent implements OnInit  {

  constructor( 
    public dialog: MatDialog,
    private auth: AuthService,
    public formulario: FormBuilder,
    private cajaService: CajaService,
    private joinDetalleVentaService: JoinDetalleVentaService,
    private toastr: ToastrService
  ) {
    const userId = this.auth.userId.getValue(); // id del usuario
  }

  totalVentas: number = 0;
  idGym: number = 0;
  total = 0;
  fechaFin: Date = new Date();
  fechaInicio: Date = new Date();
  fechaFiltro: string = "";
  opcionSeleccionada: string = "diario";
  totalAPagarCorte: number = 0;
  botonProductos: boolean = false;
  mostrarInputFlag: boolean = false;
  currentUser: string = '';
  detallesCaja: any[] = [];
  detallesCajaaaa: any[] = [];
  columnas: string[] = [
    "nombreProducto",
    "cantidadElegida",
    "precioUnitario",
    "fechaVenta",
  ];
  
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  DetallesCaja: any;

  ngOnInit(): void {
   


    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
  
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTablas();
      this.cargarVentas();
      this.actualizarTabla();
      
    }); 
  }  


  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  listaTablas(){
    this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
      (data) => {
        this.detallesCaja = data;
        this.dataSource = new MatTableDataSource(this.detallesCaja);
        this.dataSource.paginator = this.paginator; 
        this.dataSource.data = this.detallesCaja;
        const fechaActual = this.obtenerFechaActual().toISOString().slice(0, 10);
        this.fechaFiltro = fechaActual;
        this.aplicarFiltro();
        this.cargarVentas();
      },
      (error) => {
        console.error("Error al obtener detalles de la caja:", error);
      }
    );
  }

  private cargarVentas() {
    this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
      (resultData) => {
        this.detallesCaja = resultData;
        this.dataSource = new MatTableDataSource(this.detallesCaja);
        this.dataSource.paginator = this.paginator;
        const fechaActual = this.obtenerFechaActual().toISOString().slice(0, 10);
        this.fechaFiltro = fechaActual;
        this.aplicarFiltro();
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }
  

  private actualizarTabla() {
    if (!this.dataSource) {
      this.cargarVentas();
    } else {
      this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
        (resultData) => {
          this.detallesCaja = resultData;
          this.dataSource.data = this.detallesCaja;
          const fechaActual = this.obtenerFechaActual().toISOString().slice(0, 10);
          this.fechaFiltro = fechaActual;
          this.aplicarFiltro();
        },
        (error) => {
          console.error('Error al actualizar categorías:', error);
        }
      );
    }
  }

  private obtenerFechaActual(): Date {
    return new Date();
  }
  
  // Función para aplicar el filtro
  aplicarFiltro() {
    this.dataSource.filter = this.fechaFiltro; // Aplica el filtro con la fecha actual
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.fechaVenta.includes(filter); // Compara la fecha con el filtro
    };
    this.actualizarTotalVentas();
  }

  aplicarFiltross() {
    const fechaInicioFiltrar = new Date(this.fechaInicio);
    const fechaFinFiltrar = new Date(this.fechaFin);
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const fechaItem = new Date(data.fechaVenta); // Ajusta 'fechaVenta' a tu propiedad de fecha
      return fechaItem >= fechaInicioFiltrar && fechaItem <= fechaFinFiltrar;
    };
    // Concatenar las fechas con un carácter que no se espera en las fechas
    const filtro = `${fechaInicioFiltrar.toISOString().slice(0, 10)}_${fechaFinFiltrar.toISOString().slice(0, 10)}`;
    this.dataSource.filter = filtro;
    this.actualizarTotalVentas();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log("this.dataSource.filter", this.dataSource.filter);
  }

  convertirNumeroAPalabrasPesos(numero: number): string {
    const unidades = [
      "CERO",
      "UN",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const decenas = [
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISEIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ];
    const decenasCompuestas = [
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const centenas = [
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    const decimales = [
      "CERO",
      "UN",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];

    const miles = "MIL";
    const millones = "MILLÓN";
    const millonesPlural = "MILLONES";

    let palabras = "";
    const entero = Math.floor(numero);
    const decimal = Math.round((numero - entero) * 100); // Obtiene los dos decimales

    if (numero === 0) {
      palabras = "CERO";
    } else if (numero < 10) {
      palabras = unidades[numero];
    } else if (numero < 20) {
      palabras = decenas[numero - 10];
    } else if (numero < 100) {
      palabras = decenasCompuestas[Math.floor(numero / 10) - 2];
      if (numero % 10 !== 0) palabras += ` Y ${unidades[numero % 10]}`;
    } else if (numero < 1000) {
      palabras = centenas[Math.floor(numero / 100) - 1];
      if (numero % 100 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 100)}`;
    } else if (numero < 10000) {
      palabras = unidades[Math.floor(numero / 1000)] + ` ${miles}`;
      if (numero % 1000 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 1000)}`;
    } else if (numero < 1000000) {
      palabras =
        this.convertirNumeroAPalabrasPesos(Math.floor(numero / 1000)) +
        ` ${miles}`;
      if (numero % 1000 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 1000)}`;
    } else {
      palabras = "Número demasiado grande";
    }

    return palabras;
  }

  actualizarTotalVentas(): void {
    this.totalVentas = this.calcularTotalVentas();
  }
  
  calcularTotalVentas(): number {
    // Obtén los datos visibles después de aplicar filtros
    const datosVisibles = this.dataSource.filteredData || this.dataSource.data;
  
    // Realiza el cálculo del total
    return datosVisibles.reduce((total, detalle) => {
      const cantidad = parseFloat(detalle.cantidadElegida);
      const precioUnitario = parseFloat(detalle.precioUnitario);
  
      if (!isNaN(cantidad) && !isNaN(precioUnitario)) {
        return total + (cantidad * precioUnitario);
      } else {
        return total;
      }
    }, 0);
  }
  
  descargarPDF2(): void {
    // Verifica si hay datos para exportar
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      this.toastr.error('No hay información para exportar.', 'Error!!!');
      console.warn('No hay datos filtrados para exportar a PDF.');
      return;
    }
  
    // Crear un objeto jsPDF
    const pdf = new (jsPDF as any)();  // Utilizar 'as any' para evitar problemas de tipo
  
    // Encabezado del PDF
    pdf.setFontSize(20);
    pdf.text('Corte de Caja', 105, 15, null, null, 'center');
  
    // Obtener datos filtrados según el filtro actual de la tabla
    const datosFiltrados = this.dataSource.filteredData.map((detalle: any) => [
      detalle.nombreProducto,
      detalle.cantidadElegida,
      detalle.precioUnitario,
      detalle.fechaVenta
    ]);
  
    // Agregar estilos al PDF
    const styles = {
      theme: 'striped',
      headStyles: {
        fillColor: [249, 166, 64],
        textColor: [255, 255, 255]
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { cellWidth: 'wrap' }
      },
      margin: { top: 30 }
    };
  
    // Añadir filas al PDF con autoTable
    pdf.autoTable({
      head: [['Nombre Producto', 'Cantidad', 'Precio Unitario', 'Fecha']],
      body: datosFiltrados,
      startY: 35,
      styles,
      headStyles: styles.headStyles,
      bodyStyles: styles.bodyStyles,
      alternateRowStyles: styles.alternateRowStyles,
      columnStyles: styles.columnStyles
    });
  
    // Descargar el archivo PDF
    pdf.save('CorteDeCaja.pdf');
  }
  
  descargarExcel2(): void {
    // Verificar si hay datos para exportar
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      this.toastr.error('No hay información para exportar.', 'Error!!!');
      console.warn('No hay datos filtrados para exportar a Excel.');
      return;
    }
  
    // Copiar los datos filtrados
    const datosFiltrados = [...this.dataSource.filteredData];
  
    // Agregar una fila al final con el total
    datosFiltrados.push({
      'Total Ventas': this.totalVentas  // Ajusta la clave según tu estructura de datos
    });
  
    // Crear un objeto de trabajo de Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosFiltrados);
    const workbook: XLSX.WorkBook = { Sheets: { 'Datos': worksheet }, SheetNames: ['Datos'] };
  
    // Convertir el libro de trabajo a un archivo de Excel binario
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Crear un Blob y descargar el archivo Excel
    const fecha = new Date().toISOString().split('T')[0]; // Obtener la fecha actual para el nombre del archivo
    const nombreArchivo = `CorteDeCaja_${fecha}.xlsx`;
  
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, nombreArchivo); // Utiliza la función saveAs para descargar el archivo
  
    this.toastr.success('Archivo Excel generado correctamente.', '¡Éxito!');
  }

  cargarArchivo(event: any): void {
    const file = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const data: ArrayBuffer = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      // 'excelData' ahora contiene los datos del archivo Excel
  
      // Asignar 'excelData' al origen de datos de tu tabla (this.dataSource)
      this.dataSource = new MatTableDataSource<any>(excelData);
    };
    reader.readAsArrayBuffer(file);
  }

  ventas(): void {
    const dialogRef = this.dialog.open(VentasComponent, {
      width: '80%',
      height: '90%',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
    });
  }

}
