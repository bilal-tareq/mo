import { useState, useEffect, useRef } from 'react'
import * as pbi from 'powerbi-client'
import { reportsApi } from '@/api/reports'
import { useI18n } from '@/hooks/useI18n'
import './PowerBIDashboardPage.css'

export default function PowerBIDashboardPage() {
  const { locale } = useI18n()
  const reportContainer = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [configMissing, setConfigMissing] = useState(false)

  async function loadReport() {
    setLoading(true); setError(null); setConfigMissing(false)
    try {
      const response = await reportsApi.powerbiEmbed()
      const { reportId, embedUrl, embedToken } = response.data

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
          localeSettings: { language: locale === 'ar' ? 'ar' : 'en', formatLocale: locale === 'ar' ? 'ar' : 'en' }
        }
      }

      const powerbiService = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory)
      if (reportContainer.current) {
        powerbiService.reset(reportContainer.current)
        powerbiService.embed(reportContainer.current, config)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching Power BI embed info:', err)
      if (err.response?.status === 500 && err.response?.data?.error?.includes('not fully configured')) { setConfigMissing(true) }
      else { setError(err.response?.data?.details || err.response?.data?.error || (locale === 'ar' ? 'تأكد من الاتصال بالشبكة وصحة الإعدادات.' : 'Check network connectivity and configuration.')) }
      setLoading(false)
    }
  }

  useEffect(() => { loadReport() }, [])

  return (
    <div className="powerbi-page">
      <div className="header-section">
        <h1>{locale === 'ar' ? 'لوحة التحكم والتقارير المتقدمة' : 'Advanced Analytics Dashboard'}</h1>
        <p className="text-muted">{locale === 'ar' ? 'تحليل مباشر للمبيعات والمعاملات عبر نظام Power BI الآمن' : 'Live sales and transaction analysis via secure Power BI Integration'}</p>
      </div>

      {configMissing && (
        <div className="error-container missing-config">
          <div className="error-icon">⚙️</div>
          <h2>{locale === 'ar' ? 'إعدادات الاتصال غير مكتملة' : 'Power BI Settings Incomplete'}</h2>
          <p>{locale === 'ar' ? 'يرجى تهيئة متغيرات البيئة الخاصة بـ Power BI في ملف .env في الـ backend:' : 'Please configure the Power BI environment variables in your backend .env file:'}</p>
          <div className="env-code"><code>POWERBI_TENANT_ID=...<br />POWERBI_CLIENT_ID=...<br />POWERBI_CLIENT_SECRET=...<br />POWERBI_WORKSPACE_ID=...<br />POWERBI_REPORT_ID=...</code></div>
          <p className="help-text">{locale === 'ar' ? 'بعد إدخال المفاتيح الصحيحة وإعطاء الصلاحيات للتطبيق، سيتم تحميل لوحة التحكم هنا تلقائياً.' : 'Once the credentials are set and Azure permissions are granted, the dashboard will load here automatically.'}</p>
        </div>
      )}

      {!configMissing && error && (
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>{locale === 'ar' ? 'فشل تحميل لوحة البيانات' : 'Failed to Load Dashboard'}</h2>
          <p>{error}</p>
          <button onClick={loadReport} className="retry-btn">{locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}</button>
        </div>
      )}

      {!configMissing && !error && loading && (
        <div className="loading-container">
          <div className="spinner-glow"></div>
          <p>{locale === 'ar' ? 'جاري تأسيس اتصال آمن وجلب التقرير...' : 'Establishing secure connection and fetching report...'}</p>
        </div>
      )}

      <div ref={reportContainer} className="report-wrapper" style={{ display: (!loading && !error && !configMissing) ? 'block' : 'none' }}></div>
    </div>
  )
}
