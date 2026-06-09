<template>
  <div class="table-wrapper">
    <div v-if="loading" class="table-loading">
      <div v-for="i in 5" :key="i" class="skeleton" style="height:40px;margin:.5rem 1rem" />
    </div>
    <template v-else>
      <div v-if="!rows.length" class="table-empty">
        <span>لا توجد بيانات</span>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="$slots.actions">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id ?? row">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
            <td v-if="$slots.actions">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array,   required: true },
  rows:    { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped>
.table-loading { padding: .5rem; }
.table-empty   {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  font-size: .9rem;
}
</style>
