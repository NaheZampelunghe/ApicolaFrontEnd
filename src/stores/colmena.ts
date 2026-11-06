import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { ColmenaResponseDto } from 'src/models/Colmena/ColmenaResponseDto';
import type { ColmenaRequestDto } from 'src/models/Colmena/ColmenaRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useColmenaStore = defineStore('colmena', () => {
  const colmenas = ref<ColmenaResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Colmena/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ColmenaResponseDto[]>('/Colmenas/All');
      colmenas.value = data;
    } catch (e) {
      colmenas.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los colmenas`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los colmenas';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Colmenas/ById?Id=... Devuelve el colmena o null si no existe. */
  async function fetchById(id: number): Promise<ColmenaResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<ColmenaResponseDto>(`/Colmenas/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Colmenas */
  async function create(colmena: ColmenaRequestDto) {
    loading.value = true;
    try {
      await api.post('/Colmenas', colmena);
      notificarExito('Colmena creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Colmenas?Id=... */
  async function update(id: number, colmena: ColmenaRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Colmenas?Id=${id}`, colmena);
      notificarExito('Colmena modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Colmenas?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Colmenaes?Id=${id}`);
      notificarExito('Colmena eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { colmenas, loading, error, fetchAll, fetchById, create, update, borrar };
});
