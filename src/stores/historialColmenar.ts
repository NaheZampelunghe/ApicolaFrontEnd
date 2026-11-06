import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { HistorialColmenarResponseDto } from 'src/models/HistorialColmenar/HistorialColmenarResponseDto';
import type { HistorialColmenarRequestDto } from 'src/models/HistorialColmenar/HistorialColmenarRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useHistorialColmenarStore = defineStore('historialColmenar', () => {
  const historialColmenares = ref<HistorialColmenarResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/CuradoAlimentado/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<HistorialColmenarResponseDto[]>('/HistorialColmenar/All');
      historialColmenares.value = data;
    } catch (e) {
      historialColmenares.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener el historial`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener el historial';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/HistorialColmenar/ById?Id=... Devuelve el historialColmenar o null si no existe. */
  async function fetchById(id: number): Promise<HistorialColmenarResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<HistorialColmenarResponseDto>(
        `/HistorialColmenar/ById?Id=${id}`,
      );
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/HistorialColmenar */
  async function create(historialColmenar: HistorialColmenarRequestDto) {
    loading.value = true;
    try {
      await api.post('/HistorialColmenar', historialColmenar);
      notificarExito('HistorialColmenar creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/HistorialColmenar?Id=... */
  async function update(id: number, historialColmenar: HistorialColmenarRequestDto) {
    loading.value = true;
    try {
      await api.put(`/HistorialColmenar?Id=${id}`, historialColmenar);
      notificarExito('HistorialColmenar modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/HistorialColmenar?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/HistorialColmenar?Id=${id}`);
      notificarExito('HistorialColmenar eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { historialColmenares, loading, error, fetchAll, fetchById, create, update, borrar };
});
