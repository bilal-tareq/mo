import { useState, useCallback, useMemo, useEffect } from 'react'

const messages = {
  ar: {
    nav: {
      dashboard: 'لوحة التحكم',
      branches: 'الفروع',
      reports: 'التقارير',
      users: 'المستخدمون',
      sales: 'المبيعات',
      inventory: 'المخزون',
      products: 'المنتجات',
      customers: 'العملاء',
      suppliers: 'الموردين',
      system: 'النظام',
      branch: 'الفرع',
      powerbi: 'تحليلات Power BI'
    },
    dash: {
      welcome: 'مرحباً،',
      ownerSubtitle: 'نظرة عامة على أداء جميع الفروع وأنشطة المبيعات',
      branchSubtitle: 'الفرع الحالي:',
      allEarnings: 'إجمالي الأرباح اليوم',
      salesCount: 'عدد المبيعات اليوم',
      lowStock: 'تنبيهات المخزون المنخفض',
      totalCustomers: 'إجمالي العملاء',
      avgInvoice: 'متوسط قيمة الفاتورة',
      salesAnalytics: 'تحليلات المبيعات',
      analyticsDesc: 'منحنى المبيعات والنشاط المالي عبر الفترات الزمنية المحددة.',
      autoUpdate: 'تحديث تلقائي',
      efficiencyTitle: 'مستوى كفاءة التشغيل',
      balanced: 'متوازن',
      updateEfficiency: 'تحديث مستوى الكفاءة',
      refNum: 'الرقم المرجعي',
      dateCreated: 'تاريخ الإنشاء',
      september30: '30 سبتمبر',
      downloadReport: 'تحميل التقرير العام للشركة',
      performanceTitle: 'أداء الفروع والمنتجات الأكثر مبيعاً',
      prodCol: 'اسم المنتج / الفرع',
      salesCol: 'عدد المبيعات',
      trendCol: 'الاتجاه اليومي',
      priceCol: 'متوسط السعر',
      totalCol: 'إجمالي الإيرادات',
      viewAllProducts: 'عرض جميع الفروع والمنتجات',
      userActivity: 'نشاط المستخدمين',
      viewAllActivities: 'عرض سجل الأنشطة بالكامل',
      recentTransactions: 'أحدث المعاملات والمبيعات بالفرع',
      invoiceNo: 'رقم الفاتورة',
      customer: 'العميل',
      total: 'الإجمالي',
      status: 'الحالة',
      cashCustomer: 'عميل نقدي',
      branchAlerts: 'تنبيهات المخزون بالفرع',
      currentQty: 'الكمية الحالية',
      minQty: 'الحد الأدنى',
      sufficientStock: 'جميع المنتجات بمستويات كافية في هذا الفرع.'
    },
    status: {
      completed: 'مكتملة',
      pending: 'معلقة',
      refunded: 'مسترجعة',
      cancelled: 'ملغاة'
    },
    activity: {
      addedStock: 'قام بإضافة {qty} قطعة لمنتج "{product}" في المخزن.',
      completedSale: 'أتمت عملية بيع بقيمة {val} ج.م لعميل مسجل حديثاً.',
      receivedShipment: 'سجل استلام شحنة جديدة من المورد "{supplier}".',
      updatedPerms: 'قامت بتعديل صلاحيات المستخدمين في فرع المعادي.'
    },
    common: {
      logout: 'خروج',
      notifications: 'الإشعارات',
      readAll: 'قراءة الكل',
      noNotifs: 'لا توجد إشعارات',
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات',
      actions: 'إجراءات',
      ownerRole: 'المالك',
      managerRole: 'مدير فرع'
    }
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      branches: 'Branches',
      reports: 'Reports',
      users: 'Users',
      sales: 'Sales',
      inventory: 'Inventory',
      products: 'Products',
      customers: 'Customers',
      suppliers: 'Suppliers',
      system: 'System',
      branch: 'Branch',
      powerbi: 'Power BI Analytics'
    },
    dash: {
      welcome: 'Welcome,',
      ownerSubtitle: 'Overview of all branches performance and sales activities',
      branchSubtitle: 'Current Branch:',
      allEarnings: 'All Earnings Today',
      salesCount: 'Sales Count Today',
      lowStock: 'Low Stock Alerts',
      totalCustomers: 'Total Customers',
      avgInvoice: 'Avg Invoice Value',
      salesAnalytics: 'Sales Analytics',
      analyticsDesc: 'Sales curve and financial activity over the specified periods.',
      autoUpdate: 'Auto Update',
      efficiencyTitle: 'Operating Efficiency',
      balanced: 'Balanced',
      updateEfficiency: 'Update Efficiency Level',
      refNum: 'Reference Number',
      dateCreated: 'Date Created',
      september30: 'Sept 30',
      downloadReport: 'Download Overall Report',
      performanceTitle: 'Branch Performance & Best Selling Products',
      prodCol: 'Product / Branch Name',
      salesCol: 'Sales Count',
      trendCol: 'Daily Trend',
      priceCol: 'Avg Price',
      totalCol: 'Total Revenue',
      viewAllProducts: 'View All Branches & Products',
      userActivity: 'User Activity',
      viewAllActivities: 'View All Activity Logs',
      recentTransactions: 'Recent Transactions & Sales in Branch',
      invoiceNo: 'Invoice No',
      customer: 'Customer',
      total: 'Total',
      status: 'Status',
      cashCustomer: 'Cash Customer',
      branchAlerts: 'Branch Stock Alerts',
      currentQty: 'Current Qty',
      minQty: 'Min Qty',
      sufficientStock: 'All products are at sufficient levels in this branch.'
    },
    status: {
      completed: 'Completed',
      pending: 'Pending',
      refunded: 'Refunded',
      cancelled: 'Cancelled'
    },
    activity: {
      addedStock: 'Added {qty} units of "{product}" to the inventory.',
      completedSale: 'Completed a sale of {val} EGP for a newly registered customer.',
      receivedShipment: 'Recorded a new shipment from supplier "{supplier}".',
      updatedPerms: 'Updated user permissions in the Maadi branch.'
    },
    common: {
      logout: 'Logout',
      notifications: 'Notifications',
      readAll: 'Read All',
      noNotifs: 'No notifications',
      loading: 'Loading...',
      noData: 'No data',
      actions: 'Actions',
      ownerRole: 'Owner',
      managerRole: 'Branch Manager'
    }
  }
}

// Shared state outside React for persistence across components
let _locale = localStorage.getItem('locale') || 'ar'
const listeners = new Set()

function notifyListeners() {
  listeners.forEach(fn => fn(_locale))
}

export function useI18n() {
  const [locale, setLocaleState] = useState(_locale)

  useEffect(() => {
    const handler = (newLocale) => setLocaleState(newLocale)
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])

  // Sync HTML direction
  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = locale
    document.body.dir = dir
  }, [locale])

  const t = useCallback((path) => {
    const keys = path.split('.')
    let current = messages[locale]
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        return path
      }
    }
    return current
  }, [locale])

  const setLocale = useCallback((newLocale) => {
    if (newLocale === 'ar' || newLocale === 'en') {
      _locale = newLocale
      localStorage.setItem('locale', newLocale)
      notifyListeners()
    }
  }, [])

  const isRtl = useMemo(() => locale === 'ar', [locale])

  return { t, locale, setLocale, isRtl }
}
