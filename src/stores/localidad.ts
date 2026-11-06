import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { LocalidadResponseDto } from 'src/models/Localidad/LocalidadResponseDto';
import type { LocalidadRequestDto } from 'src/models/Localidad/LocalidadRequestDto';
import type { LocalidadSelectListDto } from 'src/models/Localidad/LocalidadSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useLocalidadStore = defineStore('localidad', () => {
  const localidades = ref<LocalidadResponseDto[]>([]);
  const localidadesList = ref<LocalidadSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Localidad/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<LocalidadResponseDto[]>('/Localidades/All');
      localidades.value = data;
    } catch (e) {
      localidades.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las localidades`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las localidades';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Localidades/ById?Id=... Devuelve el localidad o null si no existe. */
  async function fetchById(id: number): Promise<LocalidadResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<LocalidadResponseDto>(`/Localidades/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }
  /// GET api/Localidades/SelectList
  async function fetchSelectList() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<LocalidadSelectListDto[]>('/Localidades/SelectList');
      localidadesList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** POST api/Localidades */
  async function create(localidad: LocalidadRequestDto) {
    loading.value = true;
    try {
      await api.post('/Localidades', localidad);
      notificarExito('Localidad creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Localidades?Id=... */
  async function update(id: number, localidad: LocalidadRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Localidades?Id=${id}`, localidad);
      notificarExito('Localidad modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Localidades?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Localidades?Id=${id}`);
      notificarExito('Localidad eliminada');
    } finally {
      loading.value = false;
    }
  }

  return {
    localidades,
    localidadesList,
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
