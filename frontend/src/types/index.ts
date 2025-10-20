export interface DANGER_ZONE {
    id: string,
    type: "bombing" | "movement_restriction" | "gunfire" | "evacuation_area",
    coordinates: [number, number]; // مركز الدائرة
    radius: number; // نصف قطر الدائرة بالمتر
    description: string;
    reportedAt: Date;
    timestamp: Date;
    area: string;
    isVerified: boolean;

    // نظام التحقق (Crowdsourcing)
     verificationsByUsers: string[]; // IDs المستخدمين اللي وثقوا - موافقة على وجود خطر 
    reportedByUsers: string[];    // IDs المستخدمين اللي أبلغوا تكذيب يعني انو المكان مش خطر 
    endRequests: string[]; // IDs  المستخدمين اللي طلبوا إزالة انو الخطر انتهى
     zoneStatus: 'active' | 'pending_removal' | 'removed' | 'false_report';
}
// ثوابت عدد الاشخاص الملطلوب للتوثيق 5 ونص قطر الدائرة 200 متر
export const REQUIRED_VERIFICATIONS = 5;
export const DEFAULT_ZONE_RADIUS = 200;

export const DANGER_COLORS = {
    bombing: '#dc2626',              // أحمر للقصف
    movement_restriction: '#ca8a04',  // أصفر لقيود الحركة
    gunfire: '#ea580c',              // برتقالي لإطلاق النار  
    evacuation_area: '#92400e', // بني للإخلاء
};

export const REPORT_TYPE_LABELS = {
    bombing: 'قصف',
    movement_restriction: 'قيود حركة',
    gunfire: 'إطلاق نار',
    evacuation_area: "منطقة إخلاء",
};

// أسماء الأزرار بالعربي
export const ACTION_LABELS = {
    document: 'تأكيد',
    report: 'بلاغ',
    end: 'انتهاء الخطر',
};