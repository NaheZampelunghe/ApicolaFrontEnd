<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">
        {{ editId ? 'Editar Historial del Colmenar' : 'Nuevo Historial del Colmenar' }}
      </div>
    </q-card-section>
    <q-separator />

    <!-- Ageregar inputs para curado, alimentado, fechaVisita, cantidadMuerta -->

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <!--Alimentado-->
        <q-toggle v-model="form.alimentado" label="Alimentado" color="primary" />
        <!--Curado-->
        <q-toggle v-model="form.curado" label="Curado" color="primary" />
        <!--Fecha de visita-->
        <q-input
          v-model="form.fechaVisita"
          label="Fecha de Visita"
          outlined
          class="q-mb-sm"
          type="date"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa la fecha de visita']"
        />
        <!-- Colmenar select -->
        <q-select
          v-model="form.idColmenar"
          :options="colmenarStore.colmenaresList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Colmenar"
          stack-label
          outlined
          :loading="colmenarStore.loading"
          lazy-rules
          :rules="[(v: number | null) => v !== null || 'Seleccioná un Colmenar']"
        >
          <template #selected>
            <span v-if="form.idColmenar === null" class="text-grey-7">Seleccione un Colmenar</span>
            <span v-else>
              {{ colmenarStore.colmenaresList.find((c) => c.id === form.idColmenar)?.nombre }}
            </span>
          </template>
        </q-select>

        <!-- Cantidad de muertas -->
        <q-input
          v-model.number="form.cantidadMuertas"
          label="Cantidad de Muertas"
          outlined
          type="number"
          min="0"
          lazy-rules
          :rules="[(v: number) => v >= 0 || 'La cantidad de muertas debe ser mayor o igual a 0']"
        />

        <!-- Alimento select -->
        <q-select
          v-model="form.idAlimento"
          :options="alimentoStore.alimentosList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Alimento"
          stack-label
          outlined
          :disable="!form.alimentado"
          :loading="alimentoStore.loading"
          lazy-rules
          :rules="[
            (v: number | null) => !form.idAlimento || v !== null || 'Seleccioná un Alimento',
          ]"
        >
          <template #selected>
            <span v-if="form.idAlimento === null" class="text-grey-7">Seleccione un Alimento</span>
            <span v-else>
              {{ alimentoStore.alimentosList.find((a) => a.id === form.idAlimento)?.nombre }}
            </span>
          </template>
        </q-select>

        <!-- Medicamento select -->
        <q-select
          v-model="form.idMedicamento"
          :options="medicamentoStore.medicamentosList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Medicamento"
          stack-label
          outlined
          :disable="!form.curado"
          :loading="medicamentoStore.loading"
          lazy-rules
          :rules="[
            (v: number | null) => !form.idMedicamento || v !== null || 'Seleccioná un Medicamento',
          ]"
        >
          <template #selected>
            <span v-if="form.idMedicamento === null" class="text-grey-7"
              >Seleccione un Medicamento</span
            >
            <span v-else>
              {{
                medicamentoStore.medicamentosList.find((m) => m.id === form.idMedicamento)?.nombre
              }}
            </span>
          </template>
        </q-select>
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="historialColmenarStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { QForm } from 'quasar';
import { useHistorialColmenarStore } from 'src/stores/historialColmenar';
import { useColmenarStore } from 'stores/colmenar';
import { useAlimentoStore } from 'src/stores/alimento';
import { useMedicamentoStore } from 'src/stores/medicamento';
import type { HistorialColmenarRequestDto } from 'src/models/HistorialColmenar/HistorialColmenarRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const historialColmenarStore = useHistorialColmenarStore();
const colmenarStore = useColmenarStore();
const alimentoStore = useAlimentoStore();
const medicamentoStore = useMedicamentoStore();
const formRef = ref<QForm | null>(null);

const form = ref<HistorialColmenarRequestDto>({
  id: 0,
  curado: false,
  alimentado: false,
  fechaVisita: '',
  cantidadMuertas: 0,
  alimento: '',
  medicamento: '',
  colmenar: '',
  idAlimento: 0,
  idMedicamento: 0,
  idColmenar: 0,
});

watch(
  () => form.value.alimentado,
  (val) => {
    if (!val) form.value.idAlimento = null;
  },
);
watch(
  () => form.value.curado,
  (val) => {
    if (!val) form.value.idMedicamento = null;
  },
);

onMounted(async () => {
  await colmenarStore.fetchSelectList();
  await alimentoStore.fetchSelectList();
  await medicamentoStore.fetchSelectList();
  if (props.editId) {
    const historialColmenar = await historialColmenarStore.fetchById(props.editId);
    if (historialColmenar) {
      form.value = {
        id: historialColmenar.id,
        curado: historialColmenar.curado,
        alimentado: historialColmenar.alimentado,
        fechaVisita: historialColmenar.fechaVisita,
        cantidadMuertas: historialColmenar.cantidadMuertas,
        alimento: historialColmenar.alimento,
        medicamento: historialColmenar.medicamento,
        colmenar: historialColmenar.colmenar,
        idAlimento: historialColmenar.idAlimento,
        idMedicamento: historialColmenar.idMedicamento,
        idColmenar: historialColmenar.idColmenar,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    console.log('Formulario no válido');
    return;
  }
  const idAlimento = form.value.idAlimento;
  if (idAlimento === null) {
    return;
  }
  const idMedicamento = form.value.idMedicamento;
  if (idMedicamento === null) {
    return;
  }
  const idColmenar = form.value.idColmenar;
  if (idColmenar === null) {
    return;
  }
  const payload: HistorialColmenarRequestDto = {
    id: form.value.id,
    curado: form.value.curado,
    alimentado: form.value.alimentado,
    fechaVisita: form.value.fechaVisita,
    cantidadMuertas: form.value.cantidadMuertas,
    alimento: form.value.alimento,
    medicamento: form.value.medicamento,
    colmenar: form.value.colmenar,
    idAlimento,
    idMedicamento,
    idColmenar,
  };

  try {
    if (props.editId) {
      await historialColmenarStore.update(props.editId, payload);
    } else {
      await historialColmenarStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar el historial del colmenar');
  }
}
</script>
