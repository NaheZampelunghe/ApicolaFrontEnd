import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { AlimentoResponseDto } from 'src/models/Alimento/AlimentoResponseDto';
import type { AlimentoRequestDto } from 'src/models/Alimento/AlimentoRequestDto';
import type { AlimentoSelectListDto } from 'src/models/Alimento/AlimentoSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useAlimentoStore = defineStore('alimento', () => {
  const alimentos = ref<AlimentoResponseDto[]>([]);
  const alimentosList = ref<AlimentoSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Alimento/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<AlimentoResponseDto[]>('/Alimentos/All');
      alimentos.value = data;
    } catch (e) {
      alimentos.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los alimentos`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los alimentos';
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
      const res = await api.get<AlimentoSelectListDto[]>('/Alimentos/SelectList');
      alimentosList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Alimentoes/ById?Id=... Devuelve el alimento o null si no existe. */
  async function fetchById(id: number): Promise<AlimentoResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<AlimentoResponseDto>(`/Alimentos/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Alimentoes */
  async function create(alimento: AlimentoRequestDto) {
    loading.value = true;
    try {
      await api.post('/Alimentos', alimento);
      notificarExito('Alimento creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Alimentoes?Id=... */
  async function update(id: number, alimento: AlimentoRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Alimentos?Id=${id}`, alimento);
      notificarExito('Alimento modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Alimentoes?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Alimentos?Id=${id}`);
      notificarExito('Alimento eliminado');
    } finally {
      loading.value = false;
    }
  }

  return {
    alimentos,
    alimentosList,
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
