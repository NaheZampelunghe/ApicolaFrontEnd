import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { ProvinciaResponseDto } from 'src/models/Provincia/ProvinciaResponseDto';
import type { ProvinciaRequestDto } from 'src/models/Provincia/ProvinciaRequestDto';
import type { ProvinciaSelectListDto } from 'src/models/Provincia/ProvinciaSelectListDto';
import { notificarExito } from 'src/utils/notificar';

export const useProvinciaStore = defineStore('provincia', () => {
  const provincias = ref<ProvinciaResponseDto[]>([]);
  const provinciasList = ref<ProvinciaSelectListDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Provincia/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ProvinciaResponseDto[]>('/Provincias/All');
      provincias.value = data;
    } catch (e) {
      provincias.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las provincias`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las provincias';
      }
    } finally {
      loading.value = false;
    }
  }
  /** GET api/Provinciaes/ById?Id=... Devuelve el provincia o null si no existe. */
  async function fetchById(id: number): Promise<ProvinciaResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<ProvinciaResponseDto>(`/Provincias/ById?Id=${id}`);
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
      const res = await api.get<ProvinciaSelectListDto[]>('/Provincias/SelectList');
      provinciasList.value = res.data ?? [];
      return res.data;
    } finally {
      loading.value = false;
    }
  }
  /** POST api/Provinciaes */
  async function create(provincia: ProvinciaRequestDto) {
    loading.value = true;
    try {
      await api.post('/Provincias', provincia);
      notificarExito('Provincia creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Provinciaes?Id=... */
  async function update(id: number, provincia: ProvinciaRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Provincias?Id=${id}`, provincia);
      notificarExito('Provincia modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Provinciaes?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Provincias?Id=${id}`);
      notificarExito('Provincia eliminada');
    } finally {
      loading.value = false;
    }
  }

  return {
    provincias,
    provinciasList,
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
