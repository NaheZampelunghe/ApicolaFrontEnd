<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Historial de los Colmenares</div>
        <q-space />
        <q-input
          v-model="filtro"
          dense
          outlined
          placeholder="Buscar"
          debounce="300"
          style="width: 220px"
        >
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo historial de Colmenar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="refresh"
          :loading="historialColmenarStore.loading"
          @click="recargar"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="historialColmenarStore.historialColmenares"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="historialColmenarStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay registros para mostrar"
          loading-label="Cargando historialColmenars..."
        >
          <!-- Columna de acciones: un boton por cada operacion del ABM -->
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="primary" icon="edit" @click="abrirEdicion(props.row.id)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn dense flat color="negative" icon="delete" @click="confirmarBaja(props.row.id)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Curado -->
          <template #body-cell-curado="props">
            <q-td :props="props" class="text-center">
              <q-checkbox
                :model-value="props.row.curado"
                color="positive"
                class="no-pointer-events"
              />
            </q-td>
          </template>

          <!-- Alimentado -->
          <template #body-cell-alimentado="props">
            <q-td :props="props" class="text-center">
              <q-checkbox
                :model-value="props.row.alimentado"
                color="positive"
                class="no-pointer-events"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-banner v-if="historialColmenarStore.error" class="bg-negative text-white" rounded>
        {{ historialColmenarStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <HistorialColmenarCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section
          >Se va a eliminar el historial del colmenar. Esta accion no se puede
          deshacer.</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="eliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QTableColumn } from 'quasar';
import { useHistorialColmenarStore } from 'stores/historialColmenar';
import type { HistorialColmenarResponseDto } from 'src/models/HistorialColmenar/HistorialColmenarResponseDto';
import HistorialColmenarCreate from 'src/components/HistorialColmenar/HistorialColmenarCreate.vue';
import { notificarError } from 'src/utils/notificar';

const historialColmenarStore = useHistorialColmenarStore();
const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<HistorialColmenarResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'colmenar',
    label: 'Colmenar',
    field: 'colmenar',
    align: 'left',
    sortable: true,
  },
  { name: 'curado', label: 'Curado', field: 'curado', align: 'center', sortable: true },
  {
    name: 'medicamento',
    label: 'Medicamento',
    field: 'medicamento',
    align: 'left',
    sortable: true,
  },
  { name: 'alimentado', label: 'Alimentado', field: 'alimentado', align: 'center', sortable: true },
  {
    name: 'alimento',
    label: 'Alimento',
    field: 'alimento',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fechaVisita',
    label: 'Fecha de Visita',
    field: (row) => row.fechaVisita.substring(0, 10).split('-').reverse().join('/'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'cantidadMuertas',
    label: 'Cantidad de Muertas',
    field: 'cantidadMuertas',
    align: 'left',
    sortable: true,
  },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargar() {
  void historialColmenarStore.fetchAll();
}

function abrirAlta() {
  editId.value = null;
  mostrarFormulario.value = true;
}

function abrirEdicion(id: number) {
  editId.value = id;
  mostrarFormulario.value = true;
}

function cerrarFormulario() {
  mostrarFormulario.value = false;
  recargar();
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      await historialColmenarStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el historial del colmenar');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}
onMounted(() => {
  void historialColmenarStore.fetchAll();
});
</script>
