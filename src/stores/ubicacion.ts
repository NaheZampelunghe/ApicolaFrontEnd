import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { UbicacionResponseDto } from 'src/models/Ubicacion/UbicacionResponseDto';
import type { UbicacionRequestDto } from 'src/models/Ubicacion/UbicacionRequestDto';
import type { UbicacionSelectListDto } from 'src/models/Ubicacion/UbicacionSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useUbicacionStore = defineStore('ubicacion', () => {
  const ubicaciones = ref<UbicacionResponseDto[]>([]);
  const ubicacionesList = ref<UbicacionSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Ubicacion/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<UbicacionResponseDto[]>('/Ubicaciones/All');
      ubicaciones.value = data;
    } catch (e) {
      ubicaciones.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las ubicaciones`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las ubicaciones';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Ubicaciones/ById?Id=... Devuelve la ubicacion o null si no existe. */
  async function fetchById(id: number): Promise<UbicacionResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<UbicacionResponseDto>(`/Ubicaciones/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }
  /// GET api/Ubicaciones/SelectList
  async function fetchSelectList() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<UbicacionSelectListDto[]>('/Ubicaciones/SelectList');
      ubicacionesList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** POST api/Ubicaciones */
  async function create(ubicacion: UbicacionRequestDto) {
    loading.value = true;
    try {
      await api.post('/Ubicaciones', ubicacion);
      notificarExito('Ubicacion creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Ubicaciones?Id=... */
  async function update(id: number, ubicacion: UbicacionRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Ubicaciones?Id=${id}`, ubicacion);
      notificarExito('Ubicacion modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Ubicaciones?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Ubicaciones?Id=${id}`);
      notificarExito('Ubicacion eliminada');
    } finally {
      loading.value = false;
    }
  }

  return {
    ubicaciones,
    ubicacionesList,
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
