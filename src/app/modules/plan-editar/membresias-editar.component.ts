import { Component, OnInit, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from "@angular/forms";
import { MembresiaService } from "./../../service/membresia.service";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "src/app/service/auth.service";
import { PlanService } from "../../service/plan.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin, Observable } from "rxjs";

@Component({
  selector: "app-membresias-editar",
  templateUrl: "./membresias-editar.component.html",
  styleUrls: ["./membresias-editar.component.css"],
})
export class planEditarComponent {
  formulariodePlan: FormGroup;
  gimnasio: any;
  elID: any;
  plan: any[] = [];
  selectedMembresia: any;
  message: string = "";
  dataToUpdate: any = [];
  serviceToUpdate: any = [];
  memberships: any = [];
  selectedMembresias: any[] = [];
  servicios: any[] = [];
  idMem: any;

  constructor(
    public dialogo: MatDialogRef<planEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formulario: FormBuilder,
    private activeRoute: ActivatedRoute,
    private membresiaService: MembresiaService,
    private router: Router,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private planService: PlanService
  ) {
    this.idMem = data.idMem;
    this.formulariodePlan = this.formulario.group(
      {
        titulo: ["", Validators.required],
        detalles: ["", Validators.required],
        duracion: ["1", Validators.required],
        precio: ["", Validators.required],
        status: [1, Validators.required],
        tipo_membresia: [3],
        Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],
        fechaInicio: ["", Validators.required],
        fechaFin: ["", Validators.required],
        membresias: [[], Validators.required],
      },
      { validators: this.dateLessThan("fechaInicio", "fechaFin") }
    );
  }

  ngOnInit(): void {
    this.planService.getDataToUpdate().subscribe((data) => {
      if (data) {
        this.dataToUpdate = data;
      }
    });

    this.planService
      .consultarPlanIdMem(this.auth.idGym.getValue())
      .subscribe((respuesta) => {
        this.servicios = respuesta;
        this.planService
          .consultarPlan(this.dataToUpdate.id)
          .subscribe((respuesta) => {
            if (respuesta) {
              this.serviceToUpdate = respuesta;
              const serviciosPlan = this.serviceToUpdate[0].servicios.map(
                (servicio: any) => servicio.nombreMem
              );
              const serviciosCoincidentes = this.servicios.filter((servicio) =>
                serviciosPlan.includes(servicio.titulo)
              );

              serviciosCoincidentes.forEach((servicio) => {});

              this.formulariodePlan.setValue({
                titulo: this.serviceToUpdate[0].titulo,
                detalles: this.serviceToUpdate[0].detalles,
                duracion: this.serviceToUpdate[0].duracion,
                precio: this.serviceToUpdate[0].precio,
                status: this.serviceToUpdate[0].status,
                tipo_membresia: this.serviceToUpdate[0].tipo_membresia,
                Gimnasio_idGimnasio:
                  this.serviceToUpdate[0].Gimnasio_idGimnasio,
                fechaInicio: this.serviceToUpdate[0].fechaInicio,
                fechaFin: this.serviceToUpdate[0].fechaFin,
                membresias: serviciosCoincidentes,
              });
            }
          });
      });
  }

  actualizar() {
    if(this.formulariodePlan.valid){
    this.spinner.show();
    this.membresiaService
      .actualizarPlan(this.idMem, this.formulariodePlan.value)
      .subscribe(
        () => {
          const membresias = this.formulariodePlan.get("membresias")?.value;
          const observables: Observable<any>[] = [];
          membresias.forEach((m: any) => {
            const datosMembresias = {
              idMem: m.idMem,
              nombreMem: m.titulo,
              duracion: m.duracion,
              idPlan: this.idMem,
            };

            const observableEliminar = this.membresiaService.borrarPlanM(
              this.idMem
            );
            const observableAgregar =
              this.membresiaService.agregarPlanMem(datosMembresias);

            observables.push(observableEliminar, observableAgregar);
          });

          // Combina observables y espera a que todos se completen
          forkJoin(observables).subscribe(
            () => {
              this.spinner.hide();
              this.dialog
                .open(MensajeEmergentesComponent, {
                  data: `Membresía actualizada exitosamente`,
                })
                .afterClosed()
                .subscribe((cerrarDialogo: Boolean) => {
                  if (cerrarDialogo) {
                    this.dialogo.close(true);
                  } else {
                  }
                });
            },
            (error) => {
              this.spinner.hide();
            }
          );
        },
        (errorActualizar) => {
          this.spinner.hide();
        }
      );
    }
  }

  cerrarDialogo() {
    this.dialogo.close(true);
  }

  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);
  }

  requireMinItems(min: number) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const length = control.value ? control.value.length : 0;
      return length >= min ? null : { minItems: { value: control.value } };
    };
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        return {
          dates: "La fecha de inicio debe ser anterior a la fecha de fin",
        };
      }
      return {};
    };
  }
}
