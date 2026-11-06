import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { DuenioResponseDto } from 'src/models/Duenio/DuenioResponseDto';
import type { DuenioRequestDto } from 'src/models/Duenio/DuenioRequestDto';
import type { DuenioSelectListDto } from 'src/models/Duenio/DuenioSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useDuenioStore = defineStore('duenio', () => {
  const duenios = ref<DuenioResponseDto[]>([]);
  const dueniosList = ref<DuenioSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Duenio/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<DuenioResponseDto[]>('/Duenios/All');
      duenios.value = data;
    } catch (e) {
      duenios.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los duenios`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los duenios';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Duenios/ById?Id=... Devuelve el duenio o null si no existe. */
  async function fetchById(id: number): Promise<DuenioResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<DuenioResponseDto>(`/Duenios/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }
  /// GET api/Provincias/SelectList
  async function fetchSelectList() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<DuenioSelectListDto[]>('/Duenios/SelectList');
      dueniosList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** POST api/Duenios */
  async function create(duenio: DuenioRequestDto) {
    loading.value = true;
    try {
      await api.post('/Duenios', duenio);
      notificarExito('Duenio creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Duenios?Id=... */
  async function update(id: number, duenio: DuenioRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Duenios?Id=${id}`, duenio);
      notificarExito('Duenio modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Duenios?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Duenios?Id=${id}`);
      notificarExito('Duenio eliminado');
    } finally {
      loading.value = false;
    }
  }

  return {
    duenios,
    dueniosList,
    loading,
    error,
    fetchAll,
    fetchById,
    fetchSelectList,
    create,
    update,
    borrar,
  };
});
