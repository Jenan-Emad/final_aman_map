import React, { useState } from 'react';
import { DANGER_COLORS, REPORT_TYPE_LABELS } from '../types';
import type { DANGER_ZONE } from '../types';

interface ReportFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: DANGER_ZONE['type'], description: string, radius: number) => void;
    coordinates: [number, number] | null;
}

const ReportForm: React.FC<ReportFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    coordinates
}) => {
    const [selectedType, setSelectedType] = useState<DANGER_ZONE['type'] | null>(null);
    const [description, setDescription] = useState('');
    const [radius, setRadius] = useState(200); // نصف القطر الافتراضي 200 متر

    const dangerTypes: { type: DANGER_ZONE['type']; label: string; color: string }[] =
        Object.entries(REPORT_TYPE_LABELS).map(([type, label]) => ({
            type: type as DANGER_ZONE['type'],
            label,
            color: DANGER_COLORS[type as keyof typeof DANGER_COLORS]
        }));

    React.useEffect(() => {
        console.log('ReportForm - حالة المودال:', { isOpen, coordinates });
    }, [isOpen, coordinates]);

    const handleSubmit = () => {
        console.log('محاولة إرسال النموذج:', { selectedType, description, radius });
        if (selectedType) {
            onSubmit(selectedType, description.trim(), radius);
            resetForm();
        } else {
            console.log('النموذج غير مكتمل');
        }
    };

    const resetForm = () => {
        setSelectedType(null);
        setDescription('');
        setRadius(200);
    };

    const handleClose = () => {
        console.log('إغلاق المودال');
        resetForm();
        onClose();
    };

    // حساب مساحة الدائرة بالمتر المربع
    const calculateArea = (r: number) => {
        return Math.PI * r * r;
    };

    // تنسيق المساحة للعرض
    const formatArea = (area: number) => {
        if (area >= 1000000) {
            return `${(area / 1000000).toFixed(2)} كم²`;
        }
        return `${Math.round(area)} م²`;
    };

    console.log('ReportForm - سيتم الرندر:', { isOpen });

    if (!isOpen) {
        console.log('المودال مخفي');
        return null;
    }

    console.log('المودال سيظهر الآن!');

    return (
        <div className="modal-container" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>تحديد منطقة خطر </h3>
                </div>

                {/* أنواع الأخطار */}
                <div className="danger-types-container">
                    <div className="danger-types-title">اختر نوع الخطر:</div>

                    {dangerTypes.map((danger) => (
                        <div
                            key={danger.type}
                            className={`danger-type-item ${selectedType === danger.type ? 'danger-type-item--selected' : ''}`}
                            onClick={() => setSelectedType(danger.type)}
                        >
                            <div
                                className="danger-type-color-dot"
                                style={{ backgroundColor: danger.color }}
                            ></div>
                            <div
                                className="danger-type-checkbox"
                                style={{ borderColor: danger.color }}
                            >
                                {selectedType === danger.type && (
                                    <div
                                        className="danger-type-checkbox-inner"
                                        style={{ backgroundColor: danger.color }}
                                    ></div>
                                )}
                            </div>

                            <span className="danger-type-label">{danger.label}</span>
                        </div>
                    ))}
                </div>

                {/* تحديد نصف القطر */}
                <div className="radius-container">
                    <div className="radius-header">
                        <div className="radius-label">تحديد مساحة المنطقة:</div>
                        <div className="radius-value">
                            <span className="radius-number">{radius}</span>
                            <span className="radius-unit">متر</span>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="radius-slider"
                        style={{
                            background: selectedType 
                                ? `linear-gradient(to left, ${DANGER_COLORS[selectedType]} 0%, ${DANGER_COLORS[selectedType]} ${(radius - 50) / 950 * 100}%, #e5e7eb ${(radius - 50) / 950 * 100}%, #e5e7eb 100%)`
                                : undefined
                        }}
                    />

                    <div className="radius-labels">
                        <span>50م</span>
                        <span>1000م</span>
                    </div>

                    <div className="radius-info">
                        <div className="info-item">
                            <span className="info-icon">📏</span>
                            <span className="info-text">نصف القطر: {radius} متر</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">📐</span>
                            <span className="info-text">المساحة: {formatArea(calculateArea(radius))}</span>
                        </div>
                    </div>
                </div>

                {/* الأزرار */}
                <div className="buttons-container">
                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!selectedType}
                    >
                        إضافة
                    </button>
                    <button className="cancel-button" onClick={handleClose}>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ReportForm;