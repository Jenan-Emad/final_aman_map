import React, { useState, useEffect } from 'react';
import '../index.css';

interface MapLoadingSkeletonProps {
    showProgress?: boolean;
}

const MapLoadingSkeleton: React.FC<MapLoadingSkeletonProps> = ({ showProgress = true }) => {
    const [progress, setProgress] = useState<number>(0);
    const [loadingPhase, setLoadingPhase] = useState<string>('جاري تحميل الخريطة...');

    useEffect(() => {
        // Simulate loading progress
        const phases = [
            { progress: 30, text: 'جاري تحميل الخريطة...' },
            { progress: 60, text: 'تحميل مناطق الخطر...' },
            { progress: 85, text: 'جاري المعالجة النهائية...' },
            { progress: 100, text: 'اكتمل التحميل!' }
        ];

        let currentPhaseIndex = 0;
        
        const interval = setInterval(() => {
            if (currentPhaseIndex < phases.length) {
                const phase = phases[currentPhaseIndex];
                setProgress(phase.progress);
                setLoadingPhase(phase.text);
                currentPhaseIndex++;
            } else {
                clearInterval(interval);
            }
        }, 250); // أسرع قليلاً

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="map-skeleton-container">
            {/* Skeleton للـ Map */}
            <div className="map-skeleton-main">
                {/* Shimmer effect */}
                <div className="skeleton-shimmer"></div>

                {/* Skeleton للـ Controls */}
                <div className="skeleton-controls">
                    <div className="skeleton-zoom-control">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>

                {/* Skeleton للـ Markers (random positions) */}
                <div className="skeleton-markers">
                    <div className="skeleton-marker" style={{ top: '20%', left: '30%' }}>
                        <div className="skeleton-marker-pulse"></div>
                    </div>
                    <div className="skeleton-marker" style={{ top: '45%', left: '60%' }}>
                        <div className="skeleton-marker-pulse"></div>
                    </div>
                    <div className="skeleton-marker" style={{ top: '65%', left: '40%' }}>
                        <div className="skeleton-marker-pulse"></div>
                    </div>
                    <div className="skeleton-marker" style={{ top: '30%', left: '70%' }}>
                        <div className="skeleton-marker-pulse"></div>
                    </div>
                    <div className="skeleton-marker" style={{ top: '75%', left: '25%' }}>
                        <div className="skeleton-marker-pulse"></div>
                    </div>
                </div>

                {/* Loading card with progress */}
                <div className="skeleton-loading-card">
                    <div className="spinner"></div>
                    <span className="loading-text">{loadingPhase}</span>
                    
                    {showProgress && (
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">{progress}%</span>
                        </div>
                    )}

                    {/* Loading tips */}
                    <div className="loading-tips">
                        <p>💡 انقر على الخريطة لإضافة منطقة خطر جديدة</p>
                    </div>
                </div>

                {/* Skeleton grid pattern لخلفية الخريطة */}
                <div className="skeleton-grid">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="skeleton-grid-line"></div>
                    ))}
                </div>

                {/* Animated circles in background */}
                <div className="skeleton-bg-circles">
                    <div className="bg-circle bg-circle-1"></div>
                    <div className="bg-circle bg-circle-2"></div>
                    <div className="bg-circle bg-circle-3"></div>
                </div>
            </div>
        </div>
    );
};

export default MapLoadingSkeleton;


