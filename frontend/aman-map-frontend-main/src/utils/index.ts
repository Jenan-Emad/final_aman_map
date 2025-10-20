//  هاي الفنكشن تنشئ معرف فريد (Unique ID) لكل مستخدم أو عملية
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('amanmap_session');
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem('amanmap_session', sessionId);
  }
  return sessionId;
};

export const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'منذ ثوانٍ';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  return `منذ ${Math.floor(seconds / 86400)} يوم`;
};

// دالة لتحديد حالة المنطقة حسب الـ Crowdsourcing
export const updateZoneStatus = (zone: any): string => {
  const { documentations, reportFlags, endRequests } = zone;
  
  // إذا 5 أشخاص أبلغوا أنها مش خطر = false report
  if (reportFlags.length >= 5) {
    return 'false_report';
  }
  
  // إذا 5 أشخاص قالوا الخطر انتهى = removed
  if (endRequests.length >= 5) {
    return 'removed';
  }
  
  // إذا 5 أشخاص وثقوا = verified و active
  if (documentations.length >= 5) {
    return 'active'; // verified will be true
  }
  
  return 'active';
};