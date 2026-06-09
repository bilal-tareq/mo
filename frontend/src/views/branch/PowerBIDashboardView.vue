<template>
  <div class="powerbi-page">
    <div class="header-section">
      <h1>{{ locale === 'ar' ? 'لوحة التحكم والتقارير المتقدمة' : 'Advanced Analytics Dashboard' }}</h1>
      <p class="text-muted">
        {{ locale === 'ar' ? 'تحليل مباشر للمبيعات والمعاملات عبر نظام Power BI الآمن' : 'Live sales and transaction analysis via secure Power BI Integration' }}
      </p>
    </div>

    <!-- Configuration Missing State -->
    <div v-if="configMissing" class="error-container missing-config">
      <div class="error-icon">⚙️</div>
      <h2>{{ locale === 'ar' ? 'إعدادات الاتصال غير مكتملة' : 'Power BI Settings Incomplete' }}</h2>
      <p>
        {{ locale === 'ar' ? 'يرجى تهيئة متغيرات البيئة الخاصة بـ Power BI في ملف .env في الـ backend:' : 'Please configure the Power BI environment variables in your backend .env file:' }}
      </p>
      <div class="env-code">
        <code>
          POWERBI_TENANT_ID=...<br />
          POWERBI_CLIENT_ID=...<br />
          POWERBI_CLIENT_SECRET=...<br />
          POWERBI_WORKSPACE_ID=...<br />
          POWERBI_REPORT_ID=...
        </code>
      </div>
      <p class="help-text">
        {{ locale === 'ar' ? 'بعد إدخال المفاتيح الصحيحة وإعطاء الصلاحيات للتطبيق، سيتم تحميل لوحة التحكم هنا تلقائياً.' : 'Once the credentials are set and Azure permissions are granted, the dashboard will load here automatically.' }}
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2>{{ locale === 'ar' ? 'فشل تحميل لوحة البيانات' : 'Failed to Load Dashboard' }}</h2>
      <p>{{ error }}</p>
      <button @click="loadReport" class="retry-btn">
        {{ locale === 'ar' ? 'إعادة المحاولة' : 'Retry' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-container">
      <div class="spinner-glow"></div>
      <p>{{ locale === 'ar' ? 'جاري تأسيس اتصال آمن وجلب التقرير...' : 'Establishing secure connection and fetching report...' }}</p>
    </div>

    <!-- Report Embed Container -->
    <div v-show="!loading && !error && !configMissing" ref="reportContainer" class="report-wrapper"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as pbi from 'powerbi-client'
import { reportsApi } from '@/api/reports'
import { useI18n } from '@/composables/useI18n'

const { locale } = useI18n()

const reportContainer = ref(null)
const loading = ref(true)
const error = ref(null)
const configMissing = ref(false)

async function loadReport() {
  loading.value = true
  error.value = null
  configMissing.value = false

  try {
    const response = await reportsApi.powerbiEmbed()
    const { reportId, embedUrl, embedToken } = response.data

    await nextTick()

    const config = {
      type: 'report',
      tokenType: pbi.models.TokenType.Embed,
      accessToken: embedToken,
      embedUrl: embedUrl,
      id: reportId,
      permissions: pbi.models.Permissions.All,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: true,
        localeSettings: {
          language: locale.value === 'ar' ? 'ar' : 'en',
          formatLocale: locale.value === 'ar' ? 'ar' : 'en'
        }
      }
    }

    const powerbi = new pbi.service.Service(
      pbi.factories.hpmFactory,
      pbi.factories.wpmpFactory,
      pbi.factories.routerFactory
    )

    if (reportContainer.value) {
      // Clear the container first
      powerbi.reset(reportContainer.value)
      powerbi.embed(reportContainer.value, config)
    }
    
    loading.value = false
  } catch (err) {
    console.error('Error fetching Power BI embed info:', err)
    
    // Check if configuration is missing in the backend
    if (err.response?.status === 500 && err.response?.data?.error?.includes('not fully configured')) {
      configMissing.value = true
    } else {
      error.value = err.response?.data?.details || err.response?.data?.error || 
        (locale.value === 'ar' ? 'تأكد من الاتصال بالشبكة وصحة الإعدادات.' : 'Check network connectivity and configuration.');
    }
    loading.value = false
  }
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.powerbi-page {
  padding: 1.5rem;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.4s ease-out;
}

.header-section {
  margin-bottom: 1.5rem;
}

.header-section h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

html[dir="rtl"] .header-section {
  text-align: right;
}
html[dir="ltr"] .header-section {
  text-align: left;
}

.report-wrapper {
  flex-grow: 1;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* Loading state with pulsing glow */
.loading-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  gap: 1.25rem;
  padding: 2rem;
}

.spinner-glow {
  width: 48px;
  height: 48px;
  border: 3.5px solid var(--color-accent-soft);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite, pulseGlow 2s ease-in-out infinite;
}

/* Error container styles */
.error-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 3rem 2rem;
  text-align: center;
  max-width: 650px;
  margin: 0 auto;
  width: 100%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.error-container p {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.env-code {
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  width: 100%;
  max-width: 420px;
  text-align: left;
  margin-bottom: 1.5rem;
  font-family: monospace;
}

.env-code code {
  color: #fe5d70;
  font-size: 0.85rem;
}

.help-text {
  font-size: 0.8rem !important;
  font-style: italic;
  max-width: 450px;
}

.retry-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.retry-btn:hover {
  background-color: #019295;
  transform: translateY(-1px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(1, 169, 172, 0.1); }
  50% { box-shadow: 0 0 16px 6px rgba(1, 169, 172, 0.2); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
