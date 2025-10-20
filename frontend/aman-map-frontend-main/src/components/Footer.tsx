import React from 'react';
import '../index.css';

const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                {/* اليمين - الموقع */}
                <div className="footer-item">
                    <span className="footer-icon">📍</span>
                    <span className="footer-text">غزة - فلسطين</span>
                </div>

                {/* الوسط - البريد الإلكتروني */}
                <div className="footer-item">
                    <span className="footer-icon">@</span>
                    <a href="mailto:amanmap@gmail.com" className="footer-link">amanmap@gmail.com</a>
                </div>

                {/* اليسار - رقم الهاتف */}
                <div className="footer-item">
                    <span className="footer-icon">📞</span>
                    <a href="tel:0591234567" className="footer-link">0591234567</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;