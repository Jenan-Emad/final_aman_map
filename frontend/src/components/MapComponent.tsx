import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from "react-leaflet";
import { Icon, DivIcon, point } from "leaflet";
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { DANGER_COLORS, REPORT_TYPE_LABELS } from "../types";
import type { DANGER_ZONE } from "../types";
import { ACTION_LABELS, REQUIRED_VERIFICATIONS, DEFAULT_ZONE_RADIUS } from "../types";
import { getSessionId } from "../utils";
import { canPerformAction } from "../utils/verification";
import { timeAgo } from "../utils";
import { useState, useCallback, useEffect } from "react";
import ReportForm from "./ReportForm";
import MapLoadingSkeleton from "./MapLoadingSkeleton";


interface MapComponentProps {
    zones: DANGER_ZONE[];
    onAction: (zoneId: string, actionType: 'document' | 'report' | 'end') => void;
    onAddZone: (zone: Omit<DANGER_ZONE, 'id'>) => void;
    onShowToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const MapEventHandler = ({ onMapClick, onOutsideGazaClick }: { 
    onMapClick: (lat: number, lng: number) => void;
    onOutsideGazaClick: () => void;
}) => {
    const map = useMapEvents({
        click: (e) => {
            console.log('تم النقر على الخريطة!', e.latlng); 
            const { lat, lng } = e.latlng;
            
            // التحقق من أن النقرة داخل حدود غزة
            if (lat >= 31.22 && lat <= 31.59 && lng >= 34.26 && lng <= 34.55) {
                console.log('النقرة داخل غزة:', lat, lng);
                onMapClick(lat, lng);
            } else {
                console.log('النقرة خارج غزة:', lat, lng);
                onOutsideGazaClick();
            }
        },
    });
    
    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ zones, onAction, onAddZone, onShowToast }) => {
    const GAZA_CENTER: [number, number] = [31.5017, 34.4668];
    const [showReportForm, setShowReportForm] = useState(false);
    const [clickedCoordinates, setClickedCoordinates] = useState<[number, number] | null>(null);
    
    // Loading state - بسيط وفعال
    const [isMapLoading, setIsMapLoading] = useState(true);

    // إخفاء الـ skeleton بعد وقت قصير
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMapLoading(false);
        }, 1000); // ثانية واحدة فقط

        return () => clearTimeout(timer);
    }, []);

    // استخدام useCallback لتحسين الأداء
    const handleMapClick = useCallback((lat: number, lng: number) => {
        console.log('handleMapClick تم استدعاؤها:', lat, lng);
        setClickedCoordinates([lat, lng]);
        setShowReportForm(true);
    }, []);

    const handleOutsideGazaClick = useCallback(() => {
        console.log('نقرة خارج غزة');
        onShowToast(' يجب النقر داخل حدود قطاع غزة فقط', 'error');
    }, [onShowToast]);

    const handleReportSubmit = useCallback((type: DANGER_ZONE['type'], description: string, radius: number) => {
        if (!clickedCoordinates) return;

        const newZone: Omit<DANGER_ZONE, 'id'> = {
            type,
            coordinates: clickedCoordinates,
            radius: radius,
            description: description || `تم الإبلاغ عن ${REPORT_TYPE_LABELS[type]}`,
            timestamp: new Date(),
            reportedAt: new Date(),
            area: determineAreaName(clickedCoordinates),
            isVerified: false,
            verificationsByUsers: [getSessionId()],
            reportedByUsers: [],
            endRequests: [],
            zoneStatus: 'active'
        };

        onAddZone(newZone);
        setShowReportForm(false);
        setClickedCoordinates(null);
        
        onShowToast(` تم إضافة ${REPORT_TYPE_LABELS[type]} بنصف قطر ${radius}م بنجاح!`, 'success');
    }, [clickedCoordinates, onAddZone, onShowToast]);

    const handleReportClose = useCallback(() => {
        setShowReportForm(false);
        setClickedCoordinates(null);
    }, []);

    // دالة لتحديد اسم المنطقة بناءً على الإحداثيات
    const determineAreaName = (coordinates: [number, number]): string => {
        const [lat] = coordinates;
        
        if (lat > 31.52) return 'شمال غزة';
        if (lat > 31.45) return 'غزة';
        if (lat > 31.35) return 'الوسطى';
        if (lat > 31.25) return 'خان يونس';
        return 'رفح';
    };

    const customIcon = (type: string) => {
        const color = DANGER_COLORS[type as keyof typeof DANGER_COLORS];
        return new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="15" fill="${color}" opacity="0.3"/>
                    <circle cx="16" cy="16" r="10" fill="${color}"/>
                    <circle cx="16" cy="16" r="4" fill="white"/>
                </svg>
            `)}`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    const createCustomClusterIcon = (cluster: any) => {
        return new DivIcon({
            html: `<div class="salut" >
            <strong>${cluster.getChildCount()}</strong></div>`,
            className: "custom-marker-cluster",
            iconSize: point(33, 33, true)
        });
    };

    // Show skeleton while loading
    if (isMapLoading) {
        return <MapLoadingSkeleton />;
    }

    return (
        <>
            <MapContainer 
                center={GAZA_CENTER} 
                zoom={12} 
                style={{ height: "100vh", width: "100%", cursor: "crosshair" }}
                zoomControl={true}
                attributionControl={false}
            >
                <TileLayer
                    attribution='<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
                    url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
                />
                <MapEventHandler 
                    onMapClick={handleMapClick} 
                    onOutsideGazaClick={handleOutsideGazaClick}
                />
                {zones.map((zone) => (
                    <Circle
                        key={`circle-${zone.id}`}
                        center={zone.coordinates}
                        radius={zone.radius || DEFAULT_ZONE_RADIUS}
                        pathOptions={{
                            color: DANGER_COLORS[zone.type],
                            fillColor: DANGER_COLORS[zone.type],
                            fillOpacity: 0.2,
                            weight: 2,
                        }}
                        eventHandlers={{
                            click: (e) => {
                                e.originalEvent.stopPropagation();
                            }
                        }}
                    />
                ))}

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createCustomClusterIcon}
                >
                    {zones.map((zone) => (
                        <Marker
                            key={zone.id}
                            position={zone.coordinates}
                            icon={customIcon(zone.type)}
                            eventHandlers={{
                                click: (e) => {
                                    e.originalEvent.stopPropagation();
                                }
                            }}
                        >
                            <Popup>
                                <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
                                    <div className="popup-header">
                                        <h4>{zone.area}</h4>
                                        {zone.isVerified && (
                                            <span className="verified-badge">موثق </span>
                                        )}
                                    </div>

                                    <div className="popup-details">
                                        <p><strong>النوع:</strong> {REPORT_TYPE_LABELS[zone.type]}</p>
                                        <p><strong>نصف القطر:</strong> {zone.radius}م</p>
                                        <p><strong>التفاصيل:</strong> {zone.description}</p>
                                        <div className="time-info">
                                            {timeAgo(zone.timestamp)}
                                        </div>
                                        <p>
                                            <strong>التوثيقات:</strong> 
                                            <span style={{ 
                                                color: zone.isVerified ? '#10b981' : '#f59e0b',
                                                fontWeight: 'bold' 
                                            }}>
                                                {zone.verificationsByUsers.length}/{REQUIRED_VERIFICATIONS}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="popup-actions">
                                        <button
                                            className="popup-btn verify"
                                            onClick={() => onAction(zone.id, 'document')}
                                            disabled={!canPerformAction(zone.verificationsByUsers, getSessionId(), 'document').canPerform}
                                            title="تأكيد وجود الخطر"
                                        >
                                            {ACTION_LABELS.document} ({zone.verificationsByUsers.length})
                                        </button>

                                        <button
                                            className="popup-btn report"
                                            onClick={() => onAction(zone.id, 'report')}
                                            disabled={!canPerformAction(zone.reportedByUsers, getSessionId(), 'report').canPerform}
                                            title="الإبلاغ عن معلومات خاطئة"
                                        >
                                            {ACTION_LABELS.report} ({zone.reportedByUsers.length})
                                        </button>

                                        <button
                                            className="popup-btn end"
                                            onClick={() => onAction(zone.id, 'end')}
                                            disabled={!canPerformAction(zone.endRequests, getSessionId(), 'end').canPerform}
                                            title="تأكيد انتهاء الخطر"
                                        >
                                            {ACTION_LABELS.end} ({zone.endRequests.length})
                                        </button>
                                    </div>

                                    <div className="action-descriptions">
                                        <small style={{ color: '#6b7280', lineHeight: '1.4' }}>
                                            <strong>تأكيد:</strong> تأكيد وجود الخطر<br />
                                            <strong>بلاغ:</strong> معلومات خاطئة (ليس خطر)<br />
                                            <strong>انتهاء:</strong> الخطر انتهى وأصبح آمن
                                        </small>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            <ReportForm
                isOpen={showReportForm}
                onClose={handleReportClose}
                onSubmit={handleReportSubmit}
                coordinates={clickedCoordinates}
            />
        </>
    );
};

export default MapComponent;