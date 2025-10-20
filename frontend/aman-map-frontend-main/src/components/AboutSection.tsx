import React from 'react';
import '../index.css';

const AboutSection: React.FC = () => {
    return (
        <section className="about-section-home">
            <div className="about-container">
                <h2 className="about-title">عن التطبيق</h2>
                <p className="about-description">
                    أمان ماب هو موقع الكتروني تشاركي يعرض للمستخدمين مناطق الخطر في خريطة ويسمح للمستخدمين الآخرين إضافة مناطق الخطر وتوثيقها والتبليغ عن مناطق الخطر الخاطئة وطلب إلغاء الخطر. هذا التطبيق يهدف لتوفير وسيلة آمنة وموثوقة لمتابعة وتجنب أماكن الخطر والمحافظة على أرواح المواطنين.
                </p>
            </div>
        </section>
    );
};

export default AboutSection;