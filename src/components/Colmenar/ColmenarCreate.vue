<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar dueño' : 'Nuevo dueño' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-input
          v-model="form.nombre"
          label="Nombre"
          outlined
          class="q-mb-sm"
          :maxlength="30"
          counter
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el nombre']"
        />

        <q-select
          v-model="form.ubicacionId"
          :options="ubicacionStore.ubicacionesList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Ubicacion"
          stack-label
          outlined
          :loading="ubicacionStore.loading"
          lazy-rules
          :rules="[(v: number) => v !== 0 || 'Seleccioná una Ubicacion']"
        >
          <template #selected>
            <span v-if="form.ubicacionId === 0" class="text-grey-7">Seleccione una Ubicación</span>
            <span v-else>
              {{ ubicacionStore.ubicacionesList.find((c) => c.id === form.ubicacionId)?.nombre }}
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
        :loading="colmenarStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useColmenarStore } from 'stores/colmenar';
import { useUbicacionStore } from 'stores/ubicacion';
import type { ColmenarRequestDto } from 'src/models/Colmenar/ColmenarRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const colmenarStore = useColmenarStore();
const ubicacionStore = useUbicacionStore();
const formRef = ref<QForm | null>(null);

const form = ref<ColmenarRequestDto>({
  id: 0,
  nombre: '',
  ubicacionId: 0,
});

onMounted(async () => {
  // Primero las ubicaciones, así el combo ya tiene opciones cuando se asigna el valor
  await ubicacionStore.fetchSelectList();

  if (props.editId) {
    const colmenar = await colmenarStore.fetchById(props.editId);
    if (colmenar) {
      form.value = {
        id: colmenar.id,
        nombre: colmenar.nombre,
        ubicacionId: colmenar.ubicacionId,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const ubicacionId = form.value.ubicacionId;
  if (ubicacionId === null) {
    return;
  }
  const payload: ColmenarRequestDto = {
    id: form.value.id,
    nombre: form.value.nombre,
    ubicacionId,
  };

  try {
    if (props.editId) {
      await colmenarStore.update(props.editId, payload);
    } else {
      await colmenarStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar la colmenar');
  }
}
</script>
