//  للتحقق من مكان وهوية الشخص
export const verifyUserLocation = (): boolean => {
    // التحقق بالباك اند باستخدام GPS أو IP   
    return true;// افتراضا انو المستخدم بغزة 
}

export const verifyUserIdentity = (sessionId: string): boolean => {
    // طبعا التحقق كمان بيكون بالباك اند عن طريق 
    // 1. فحص IP address
    // 2. Browser fingerprinting
    // 3. Time-based restrictions اللي هو تقييد الوقت بين المحاولات
    return sessionId && sessionId.length > 10; //صالح  sessionId  بس هون عم نتأكد انو 
}

export const canPerformAction = (
    actionArray: string[],
    sessionId: string,
    actionType: 'add' | 'document' | 'report' | 'end'
): { canPerform: boolean; reason?: string } => {
    // التحقق من الموقع (مطلوب لكل العمليات)
    if (!verifyUserLocation()) {
        return { canPerform: false, reason: 'الموقع خارج قطاع غزة' };
    }
    // التحقق من الهوية (مطلوب للتوثيق أو التأكيد والبلاغ والانتهاء)
    if (actionType !== 'add' && !verifyUserIdentity(sessionId)) {
        return { canPerform: false, reason: 'فشل التحقق من الهوية' };
    }
    // التحقق من عدم تكرار العملية
    if (actionArray.includes(sessionId)) {
        return { canPerform: false, reason: 'تم تنفيذ هذا الإجراء مسبقاً' };
    }

    return { canPerform: true };
};
