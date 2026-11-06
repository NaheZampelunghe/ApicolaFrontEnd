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
        <q-input
          v-model="form.apellido"
          label="Apellido"
          outlined
          class="q-mb-sm"
          :maxlength="30"
          counter
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el apellido']"
        />
        <q-input
          v-model="form.renapa"
          label="RENAPA"
          outlined
          class="q-mb-sm"
          :maxlength="30"
          counter
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el RENAPA']"
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
        :loading="duenioStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useDuenioStore } from 'stores/duenio';
import { useLocalidadStore } from 'stores/localidad';
import type { DuenioRequestDto } from 'src/models/Duenio/DuenioRequestDto';
import { notificarError } from 'src/utils/notificar';

const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const duenioStore = useDuenioStore();
const localidadStore = useLocalidadStore();
const formRef = ref<QForm | null>(null);

const form = ref<DuenioRequestDto>({
  id: 0,
  nombre: '',
  apellido: '',
  renapa: '',
  idLocalidad: 0,
});

onMounted(async () => {
  // Primero las localidades, así el combo ya tiene opciones cuando se asigna el valor
  await localidadStore.fetchSelectList();

  if (props.editId) {
    const duenio = await duenioStore.fetchById(props.editId);
    if (duenio) {
      form.value = {
        id: duenio.id,
        nombre: duenio.nombre,
        apellido: duenio.apellido,
        renapa: duenio.renapa,
        idLocalidad: duenio.idLocalidad,
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
  const payload: DuenioRequestDto = {
    id: form.value.id,
    nombre: form.value.nombre,
    apellido: form.value.apellido,
    renapa: form.value.renapa,
    idLocalidad,
  };

  try {
    if (props.editId) {
      await duenioStore.update(props.editId, payload);
    } else {
      await duenioStore.create(payload);
    }
    emit('close');
  } catch (e) {
    console.error(e);
    notificarError('No se pudo guardar la duenio');
  }
}
</script>
