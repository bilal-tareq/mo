<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div :class="['modal', `modal-${size}`]" role="dialog" :aria-label="title">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="close" aria-label="إغلاق">✕</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props  = defineProps({
  modelValue: { type: Boolean, required: true },
  title:      { type: String,  default: '' },
  size:       { type: String,  default: 'md' }, // sm | md | lg | xl
})
const emit = defineEmits(['update:modelValue'])
function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-height: 90vh;
  display: flex; flex-direction: column;
}
.modal-sm { max-width: 400px; }
.modal-md { max-width: 560px; }
.modal-lg { max-width: 800px; }
.modal-xl { max-width: 1100px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.modal-title { font-size: 1.1rem; font-weight: 700; }
.modal-close {
  background: none; border: none; color: var(--color-text-muted);
  font-size: 1.1rem; cursor: pointer; transition: color var(--transition);
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { color: var(--color-text); background: var(--color-surface-2); }
.modal-body   { padding: 1.5rem; overflow-y: auto; flex: 1; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--color-border); display: flex; gap: .75rem; justify-content: flex-end; }

/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from,   .modal-leave-to    { opacity: 0; }
.modal-enter-active .modal { animation: modalSlideIn .25s ease; }
@keyframes modalSlideIn {
  from { transform: scale(.95) translateY(-10px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}
</style>
