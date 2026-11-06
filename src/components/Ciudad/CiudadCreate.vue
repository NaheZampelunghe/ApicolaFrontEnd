<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar ciudad' : 'Nueva ciudad' }}</div>
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
          v-model="form.idProvincia"
          :options="provinciaStore.provinciasList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Provincia"
          stack-label
          outlined
          :loading="provinciaStore.loading"
          lazy-rules
          :rules="[(v: number | null) => v !== 0 || 'Seleccioná una provincia']"
        >
          <template #selected>
            <span v-if="form.idProvincia === 0" class="text-grey-7">Seleccione una provincia</span>
            <span v-else>
              {{ provinciaStore.provinciasList.find((p) => p.id === form.idProvincia)?.nombre }}
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
        :loading="ciudadStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useCiudadStore } from 'stores/ciudad';
import { useProvinciaStore } from 'stores/provincia';
import type { CiudadRequestDto } from 'src/models/Ciudad/CiudadRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const ciudadStore = useCiudadStore();
const provinciaStore = useProvinciaStore();
const formRef = ref<QForm | null>(null);

const form = ref<CiudadRequestDto>({
  id: 0,
  nombre: '',
  idProvincia: 0,
});

onMounted(async () => {
  // Primero las provincias, así el combo ya tiene opciones cuando se asigna el valor
  await provinciaStore.fetchSelectList();

  if (props.editId) {
    const ciudad = await ciudadStore.fetchById(props.editId);
    if (ciudad) {
      form.value = {
        id: ciudad.id,
        nombre: ciudad.nombre,
        idProvincia: ciudad.idProvincia,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const idProvincia = form.value.idProvincia;
  if (idProvincia === 0) {
    return;
  }
  const payload: CiudadRequestDto = {
    id: form.value.id,
    nombre: form.value.nombre,
    idProvincia,
  };

  try {
    if (props.editId) {
      await ciudadStore.update(props.editId, payload);
    } else {
      await ciudadStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar la ciudad');
  }
}
</script>
