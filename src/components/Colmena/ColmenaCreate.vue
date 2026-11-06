<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar Colmena' : 'Nueva Colmena' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
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
          :rules="[(v: number) => v !== 0 || 'Seleccioná una Colmenar']"
        >
          <template #selected>
            <span v-if="form.idColmenar === 0" class="text-grey-7">Seleccione un Colmenar</span>
            <span v-else>
              {{ colmenarStore.colmenaresList.find((c) => c.id === form.idColmenar)?.nombre }}
            </span>
          </template>
        </q-select>

        <q-select
          v-model="form.idDuenio"
          :options="duenioStore.dueniosList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Duenio"
          stack-label
          outlined
          :loading="duenioStore.loading"
          lazy-rules
          :rules="[(v: number) => v !== 0 || 'Seleccioná un Dueño']"
        >
          <template #selected>
            <span v-if="form.idDuenio === 0" class="text-grey-7">Seleccione un Dueño</span>
            <span v-else>
              {{ duenioStore.dueniosList.find((c) => c.id === form.idDuenio)?.nombre }}
            </span>
          </template>
        </q-select>

        <q-toggle v-model="form.viva" label="Viva" color="primary" left-label class="q-mt-md" />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="colmenaStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useColmenaStore } from 'stores/colmena';
import { useDuenioStore } from 'stores/duenio';
import { useColmenarStore } from 'stores/colmenar';
import type { ColmenaRequestDto } from 'src/models/Colmena/ColmenaRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const colmenaStore = useColmenaStore();
const duenioStore = useDuenioStore();
const colmenarStore = useColmenarStore();
const formRef = ref<QForm | null>(null);

const form = ref<ColmenaRequestDto>({
  id: 0,
  idColmenar: 0,
  idDuenio: 0,
  viva: true,
});

onMounted(async () => {
  // Primero las duenioes, así el combo ya tiene opciones cuando se asigna el valor
  await duenioStore.fetchSelectList();
  await colmenarStore.fetchSelectList();

  if (props.editId) {
    const colmena = await colmenaStore.fetchById(props.editId);
    if (colmena) {
      form.value = {
        id: colmena.id,
        idColmenar: colmena.idColmenar,
        idDuenio: colmena.idDuenio,
        viva: colmena.viva,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const duenioId = form.value.idDuenio;
  if (duenioId === null) {
    return;
  }
  const payload: ColmenaRequestDto = {
    id: form.value.id,
    idColmenar: form.value.idColmenar,
    idDuenio: form.value.idDuenio,
    viva: form.value.viva,
  };

  try {
    if (props.editId) {
      await colmenaStore.update(props.editId, payload);
    } else {
      await colmenaStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar la colmena');
  }
}
</script>
