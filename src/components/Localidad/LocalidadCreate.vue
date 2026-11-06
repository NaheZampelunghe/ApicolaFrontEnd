<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar localidad' : 'Nueva localidad' }}</div>
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
          v-model="form.idCiudad"
          :options="ciudadStore.ciudadesList"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Ciudad"
          stack-label
          outlined
          :loading="ciudadStore.loading"
          lazy-rules
          :rules="[(v: number | 0) => v !== 0 || 'Seleccioná una Ciudad']"
        >
          <template #selected>
            <span v-if="form.idCiudad === 0" class="text-grey-7">Seleccione una Ciudad</span>
            <span v-else>
              {{ ciudadStore.ciudadesList.find((c) => c.id === form.idCiudad)?.nombre }}
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
        :loading="localidadStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useLocalidadStore } from 'stores/localidad';
import { useCiudadStore } from 'stores/ciudad';
import type { LocalidadRequestDto } from 'src/models/Localidad/LocalidadRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const localidadStore = useLocalidadStore();
const ciudadStore = useCiudadStore();
const formRef = ref<QForm | null>(null);

const form = ref<LocalidadRequestDto>({
  id: 0,
  nombre: '',
  idCiudad: 0,
});

onMounted(async () => {
  // Primero las ciudades, así el combo ya tiene opciones cuando se asigna el valor
  await ciudadStore.fetchAll();

  if (props.editId) {
    const localidad = await localidadStore.fetchById(props.editId);
    if (localidad) {
      form.value = {
        id: localidad.id,
        nombre: localidad.nombre,
        idCiudad: localidad.idCiudad,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const idCiudad = form.value.idCiudad;
  if (idCiudad === null) {
    return;
  }
  const payload: LocalidadRequestDto = {
    id: form.value.id,
    nombre: form.value.nombre,
    idCiudad,
  };

  try {
    if (props.editId) {
      await localidadStore.update(props.editId, payload);
    } else {
      await localidadStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar la localidad');
  }
}
</script>
