<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar medicamento' : 'Nuevo medicamento' }}</div>
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
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="medicamentoStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useMedicamentoStore } from 'stores/medicamento';
import type { MedicamentoRequestDto } from 'src/models/Medicamento/MedicamentoRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const medicamentoStore = useMedicamentoStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<MedicamentoRequestDto>({
  id: 0,
  nombre: '',
});

// Si es modificacion, se traen los datos actuales del medicamento
onMounted(async () => {
  if (props.editId) {
    const medicamento = await medicamentoStore.fetchById(props.editId);
    if (medicamento) {
      form.value = {
        id: medicamento.id,
        nombre: medicamento.nombre,
      };
    }
  }
});

async function onSubmit() {
  console.log('1. entra onSubmit');
  const valido = await formRef.value?.validate();
  console.log('2. valido:', valido);
  if (!valido) {
    return;
  }
  try {
    if (props.editId) {
      await medicamentoStore.update(props.editId, form.value);
    } else {
      await medicamentoStore.create(form.value);
    }
    console.log('3. guardado, emito close');
    emit('close');
  } catch (e) {
    console.error('4. error al guardar:', e);
    notificarError('No se pudo guardar el medicamento');
  }
}
</script>
