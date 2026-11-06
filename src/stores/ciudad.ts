import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { CiudadResponseDto } from 'src/models/Ciudad/CiudadResponseDto';
import type { CiudadRequestDto } from 'src/models/Ciudad/CiudadRequestDto';
import { notificarExito } from 'src/utils/notificar';
import type { CiudadSelectListDto } from 'src/models/Ciudad/CiudadSelectListDto';

export const useCiudadStore = defineStore('ciudad', () => {
  const ciudades = ref<CiudadResponseDto[]>([]);
  const ciudadesList = ref<CiudadSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Ciudad/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<CiudadResponseDto[]>('/Ciudades/All');
      ciudades.value = data;
    } catch (e) {
      ciudades.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las ciudades`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las ciudades';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Ciudades/ById?Id=... Devuelve el ciudad o null si no existe. */
  async function fetchById(id: number): Promise<CiudadResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<CiudadResponseDto>(`/Ciudades/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }
  /// GET api/Ciudades/SelectList
  async function fetchSelectList() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<CiudadSelectListDto[]>('/Ciudades/SelectList');
      ciudadesList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** POST api/Ciudades */
  async function create(ciudad: CiudadRequestDto) {
    loading.value = true;
    try {
      await api.post('/Ciudades', ciudad);
      notificarExito('Ciudad creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Ciudades?Id=... */
  async function update(id: number, ciudad: CiudadRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Ciudades?Id=${id}`, ciudad);
      notificarExito('Ciudad modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Ciudades?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Ciudades?Id=${id}`);
      notificarExito('Ciudad eliminado');
    } finally {
      loading.value = false;
    }
  }

  return {
    ciudades,
    ciudadesList,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    borrar,
    fetchSelectList,
  };
});
