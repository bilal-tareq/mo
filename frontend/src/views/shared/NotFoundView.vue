<template>
  <div class="not-found">
    <div class="nf-content">
      <div class="nf-code">404</div>
      <h1>الصفحة غير موجودة</h1>
      <p class="text-muted">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <RouterLink to="/" class="btn btn-primary btn-md" style="margin-top:1.5rem;display:inline-flex">
        العودة للرئيسية
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.nf-content { animation: fadeIn .4s ease; }
.nf-code {
  font-size: 6rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 1rem;
}
h1 { font-size: 1.5rem; margin-bottom: .5rem; }
</style>
