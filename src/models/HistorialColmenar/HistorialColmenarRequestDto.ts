export interface HistorialColmenarRequestDto {
  id: number;
  curado: boolean | null;
  alimentado: boolean | null;
  fechaVisita: string;
  cantidadMuertas: number;
  alimento: string;
  medicamento: string;
  colmenar: string;
  idAlimento: number | null;
  idMedicamento: number | null;
  idColmenar: number | null;
}
