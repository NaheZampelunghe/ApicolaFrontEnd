<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Colmenas</div>
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
          <q-tooltip>Nueva colmena</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="colmenaStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="colmenaStore.colmenas"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="colmenaStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay colmenas para mostrar"
          loading-label="Cargando colmenas..."
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
          <!-- Viva -->
          <template #body-cell-viva="props">
            <q-td :props="props" class="text-center">
              <q-checkbox
                :model-value="props.row.viva"
                color="positive"
                class="no-pointer-events"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-banner v-if="colmenaStore.error" class="bg-negative text-white" rounded>
        {{ colmenaStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <ColmenaCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section
          >Se va a eliminar el colmena. Esta accion no se puede deshacer.</q-card-section
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
import { useColmenaStore } from 'stores/colmena';
import type { ColmenaResponseDto } from 'src/models/Colmena/ColmenaResponseDto';
import ColmenaCreate from 'src/components/Colmena/ColmenaCreate.vue';
import { notificarError } from 'src/utils/notificar';

const colmenaStore = useColmenaStore();
const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<ColmenaResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  { name: 'colmenar', label: 'Colmenar', field: 'colmenar', align: 'left', sortable: true },
  { name: 'duenio', label: 'Dueño', field: 'duenio', align: 'left', sortable: true },
  { name: 'viva', label: 'Viva', field: 'viva', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargar() {
  void colmenaStore.fetchAll();
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
      await colmenaStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar la colmena');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}
onMounted(() => {
  void colmenaStore.fetchAll();
});
</script>
