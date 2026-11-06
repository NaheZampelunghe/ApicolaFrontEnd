<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar ubicacion' : 'Nueva ubicacion' }}</div>
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
          v-model="form.idLocalidad"
          :options="localidadStore.localidadesList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Localidad"
          stack-label
          outlined
          :loading="localidadStore.loading"
          lazy-rules
          :rules="[(v: number) => v !== 0 || 'Seleccioná una Localidad']"
        >
          <template #selected>
            <span v-if="form.idLocalidad === 0" class="text-grey-7">Seleccione una Localidad</span>
            <span v-else>
              {{ localidadStore.localidadesList.find((c) => c.id === form.idLocalidad)?.nombre }}
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
        :loading="ubicacionStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useUbicacionStore } from 'stores/ubicacion';
import { useLocalidadStore } from 'stores/localidad';
import type { UbicacionRequestDto } from 'src/models/Ubicacion/UbicacionRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const ubicacionStore = useUbicacionStore();
const localidadStore = useLocalidadStore();
const formRef = ref<QForm | null>(null);

const form = ref<UbicacionRequestDto>({
  id: 0,
  nombre: '',
  idLocalidad: 0,
});

onMounted(async () => {
  // Primero las localidades, así el combo ya tiene opciones cuando se asigna el valor
  await localidadStore.fetchAll();

  if (props.editId) {
    const ubicacion = await ubicacionStore.fetchById(props.editId);
    if (ubicacion) {
      form.value = {
        id: ubicacion.id,
        nombre: ubicacion.nombre,
        idLocalidad: ubicacion.idLocalidad,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const idLocalidad = form.value.idLocalidad;
  if (idLocalidad === null) {
    return;
  }
  const payload: UbicacionRequestDto = {
    id: form.value.id,
    nombre: form.value.nombre,
    idLocalidad,
  };

  try {
    if (props.editId) {
      await ubicacionStore.update(props.editId, payload);
    } else {
      await ubicacionStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar la ubicacion');
  }
}
</script>
