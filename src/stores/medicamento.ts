import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { MedicamentoResponseDto } from 'src/models/Medicamento/MedicamentoResponseDto';
import type { MedicamentoRequestDto } from 'src/models/Medicamento/MedicamentoRequestDto';
import type { MedicamentoSelectListDto } from 'src/models/Medicamento/MedicamentoSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useMedicamentoStore = defineStore('medicamento', () => {
  const medicamentos = ref<MedicamentoResponseDto[]>([]);
  const medicamentosList = ref<MedicamentoSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Medicamento/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<MedicamentoResponseDto[]>('/Medicamentos/All');
      medicamentos.value = data;
    } catch (e) {
      medicamentos.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los medicamentos`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los medicamentos';
      }
    } finally {
      loading.value = false;
    }
  }
  /// GET api/Alimento/SelectList
  async function fetchSelectList() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<MedicamentoSelectListDto[]>('/Medicamentos/SelectList');
      medicamentosList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Medicamentos/ById?Id=... Devuelve el medicamento o null si no existe. */
  async function fetchById(id: number): Promise<MedicamentoResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<MedicamentoResponseDto>(`/Medicamentos/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Medicamentos */
  async function create(medicamento: MedicamentoRequestDto) {
    loading.value = true;
    try {
      await api.post('/Medicamentos', medicamento);
      notificarExito('Medicamento creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Medicamentos?Id=... */
  async function update(id: number, medicamento: MedicamentoRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Medicamentos?Id=${id}`, medicamento);
      notificarExito('Medicamento modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Medicamentos?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Medicamentos?Id=${id}`);
      notificarExito('Medicamento eliminado');
    } finally {
      loading.value = false;
    }
  }

  return {
    medicamentos,
    medicamentosList,
    loading,
    error,
    fetchAll,
    fetchSelectList,
    fetchById,
    create,
    update,
    borrar,
  };
});
