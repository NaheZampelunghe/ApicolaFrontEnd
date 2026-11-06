import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { ColmenarResponseDto } from 'src/models/Colmenar/ColmenarResponseDto';
import type { ColmenarRequestDto } from 'src/models/Colmenar/ColmenarRequestDto';
import type { ColmenarSelectListDto } from 'src/models/Colmenar/ColmenarSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useColmenarStore = defineStore('colmenar', () => {
  const colmenares = ref<ColmenarResponseDto[]>([]);
  const colmenaresList = ref<ColmenarSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Colmenar/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ColmenarResponseDto[]>('/Colmenares/All');
      colmenares.value = data;
    } catch (e) {
      colmenares.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los colmenares`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los colmenares';
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
      const res = await api.get<ColmenarSelectListDto[]>('/Colmenares/SelectList');
      colmenaresList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Colmenars/ById?Id=... Devuelve el colmenar o null si no existe. */
  async function fetchById(id: number): Promise<ColmenarResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<ColmenarResponseDto>(`/Colmenares/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Colmenars */
  async function create(colmenar: ColmenarRequestDto) {
    loading.value = true;
    try {
      await api.post('/Colmenares', colmenar);
      notificarExito('Colmenar creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Colmenars?Id=... */
  async function update(id: number, colmenar: ColmenarRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Colmenares?Id=${id}`, colmenar);
      notificarExito('Colmenar modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Colmenars?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Colmenares?Id=${id}`);
      notificarExito('Colmenar eliminado');
    } finally {
      loading.value = false;
    }
  }

  return {
    colmenares,
    colmenaresList,
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
