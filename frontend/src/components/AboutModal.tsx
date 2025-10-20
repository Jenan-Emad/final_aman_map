import React from 'react';
import '../index.css';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="about-modal-header">
                    <h2>خريطة أمان - AmanMap</h2>
                    <button className="about-close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="about-modal-body">
                    {/* نبذة عن التطبيق */}
                    <section className="about-section">
                        <div className="about-icon">📍</div>
                        <h3>ما هي خريطة أمان؟</h3>
                        <p>
                            خريطة أمان هي منصة مجتمعية تفاعلية تهدف إلى توفير معلومات فورية عن مناطق الخطر
                            في قطاع غزة. يعتمد التطبيق على مشاركة المجتمع المحلي في الإبلاغ عن المخاطر
                            والتحقق منها لضمان دقة المعلومات وسلامة الجميع.
                        </p>
                    </section>

                    {/* كيفية العمل */}
                    <section className="about-section">
                        <div className="about-icon">⚙️</div>
                        <h3>كيف يعمل التطبيق؟</h3>
                        <div className="about-steps">
                            <div className="about-step">
                                <span className="step-number">1</span>
                                <div className="step-content">
                                    <h4>الإبلاغ عن الخطر</h4>
                                    <p>انقر على أي مكان في الخريطة داخل قطاع غزة لإضافة تقرير جديد عن منطقة خطر</p>
                                </div>
                            </div>
                            <div className="about-step">
                                <span className="step-number">2</span>
                                <div className="step-content">
                                    <h4>التحقق المجتمعي</h4>
                                    <p>يمكن للمستخدمين الآخرين تأكيد الخطر أو الإبلاغ عنه إذا كان غير صحيح</p>
                                </div>
                            </div>
                            <div className="about-step">
                                <span className="step-number">3</span>
                                <div className="step-content">
                                    <h4>التوثيق التلقائي</h4>
                                    <p>بعد 5 تأكيدات من مستخدمين مختلفين، يتم توثيق المنطقة تلقائياً</p>
                                </div>
                            </div>
                            <div className="about-step">
                                <span className="step-number">4</span>
                                <div className="step-content">
                                    <h4>تحديث الحالة</h4>
                                    <p>يمكن للمستخدمين تحديث حالة المنطقة عند انتهاء الخطر</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* أنواع المخاطر */}
                    <section className="about-section">
                        <div className="about-icon">🚨</div>
                        <h3>أنواع المخاطر المتاحة</h3>
                        <div className="danger-types-grid">
                            <div className="danger-type-card">
                                <div className="danger-color-indicator" style={{ backgroundColor: '#dc2626' }}></div>
                                <h4>قصف</h4>
                                <p>قصف مدفعي أو جوي في المنطقة</p>
                            </div>
                            <div className="danger-type-card">
                                <div className="danger-color-indicator" style={{ backgroundColor: '#ea580c' }}></div>
                                <h4>إطلاق نار</h4>
                                <p>إطلاق نار أو اشتباكات مسلحة</p>
                            </div>
                            <div className="danger-type-card">
                                <div className="danger-color-indicator" style={{ backgroundColor: '#ca8a04' }}></div>
                                <h4>قيود حركة</h4>
                                <p>حواجز أو قيود على التنقل</p>
                            </div>
                            <div className="danger-type-card">
                                <div className="danger-color-indicator" style={{ backgroundColor: '#92400e' }}></div>
                                <h4>منطقة إخلاء</h4>
                                <p>مناطق مطلوب إخلاؤها للمدنيين</p>
                            </div>
                        </div>
                    </section>

                    {/* الميزات */}
                    <section className="about-section">
                        <div className="about-icon">✨</div>
                        <h3>الميزات الرئيسية</h3>
                        <ul className="features-list">
                            <li>
                                <span className="feature-icon">🗺️</span>
                                <span>خريطة تفاعلية لقطاع غزة</span>
                            </li>
                            <li>
                                <span className="feature-icon">👥</span>
                                <span>نظام تحقق مجتمعي لضمان دقة المعلومات</span>
                            </li>
                            <li>
                                <span className="feature-icon">⚡</span>
                                <span>تحديثات فورية في الوقت الفعلي</span>
                            </li>
                            <li>
                                <span className="feature-icon">🔒</span>
                                <span>حماية من التلاعب والمعلومات الكاذبة</span>
                            </li>
                            <li>
                                <span className="feature-icon">📱</span>
                                <span>واجهة سهلة الاستخدام على كل الأجهزة</span>
                            </li>
                            <li>
                                <span className="feature-icon">🌐</span>
                                <span>دعم كامل للغة العربية</span>
                            </li>
                        </ul>
                    </section>

                    {/* إرشادات الاستخدام */}
                    <section className="about-section">
                        <div className="about-icon">💡</div>
                        <h3>إرشادات الاستخدام</h3>
                        <div className="guidelines">
                            <div className="guideline-item guideline-do">
                                <h4>✅ يُرجى</h4>
                                <ul>
                                    <li>الإبلاغ فقط عن معلومات دقيقة ومؤكدة</li>
                                    <li>التحقق من الموقع بدقة قبل الإبلاغ</li>
                                    <li>إضافة تفاصيل واضحة ومفيدة</li>
                                    <li>تحديث حالة المناطق عند انتهاء الخطر</li>
                                </ul>
                            </div>
                            <div className="guideline-item guideline-dont">
                                <h4>❌ يُمنع</h4>
                                <ul>
                                    <li>نشر معلومات كاذبة أو مضللة</li>
                                    <li>استخدام التطبيق لأغراض غير إنسانية</li>
                                    <li>إضافة تقارير عشوائية أو غير دقيقة</li>
                                    <li>التلاعب بنظام التحقق المجتمعي</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* معلومات الاتصال */}
                    <section className="about-section">
                        <div className="about-icon">📧</div>
                        <h3>تواصل معنا</h3>
                        <p className="contact-info">
                            للاستفسارات والاقتراحات أو الإبلاغ عن مشاكل تقنية، يرجى التواصل معنا:
                        </p>
                        <div className="contact-methods">
                            <a href="mailto:amanmap@gmail.com" className="contact-link">
                                amanmap@gmail.com
                            </a>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="about-footer">
                        <p>
                            تم تطوير هذا التطبيق بهدف خدمة المجتمع وحماية أرواح المدنيين في قطاع غزة.
                            نحن نؤمن بأن المعلومات الدقيقة والموثوقة يمكن أن تنقذ الأرواح.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;


