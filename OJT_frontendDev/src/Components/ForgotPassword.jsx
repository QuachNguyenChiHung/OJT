import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/theme.css';

const logoImg = '/img/logo.png';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [identifier, setIdentifier] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        try {
            await api.post('/auth/forgot-password', {
                email: identifier,
                username: identifier
            });
            setMessage('Mã xác nhận đã được gửi đến email của bạn!');
            setMessageType('success');
            setStep(2);
        } catch (error) {
            const msg = error?.response?.data?.error || 'Không thể gửi mã xác nhận';
            setMessage(msg);
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');

        if (newPassword !== confirmPassword) {
            setMessage('Mật khẩu không khớp!');
            setMessageType('error');
            return;
        }
        if (newPassword.length < 8) {
            setMessage('Mật khẩu phải có ít nhất 8 ký tự!');
            setMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/auth/reset-password', {
                email: identifier,
                username: identifier,
                code: code,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            });
            setMessage('Đặt lại mật khẩu thành công!');
            setMessageType('success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const msg = error?.response?.data?.error || 'Không thể đặt lại mật khẩu';
            setMessage(msg);
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="text-center">
                    <img className="logo" src={logoImg} alt="Furious Five Fashion" />
                    <h4>{step === 1 ? 'Quên Mật Khẩu' : 'Đặt Lại Mật Khẩu'}</h4>
                </div>

                {message && (
                    <div className={messageType === 'error' ? 'alert-error-themed' : 'alert-success-themed'} 
                         style={{ marginBottom: '20px' }}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendCode}>
                        <div className="text-center mb-4">
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔐</div>
                            <p style={{ color: '#666' }}>
                                Nhập email hoặc username để nhận mã xác nhận
                            </p>
                        </div>
                        <div className="mb-4">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Email hoặc Username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn btn-submit w-100" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Mã Xác Nhận'}
                        </button>
                        <div className="text-center mt-4">
                            <a href="/login">← Quay lại đăng nhập</a>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="text-center mb-4">
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
                            <p style={{ color: '#666' }}>
                                Nhập mã xác nhận đã gửi đến<br/>
                                <strong style={{ color: '#00B4DB' }}>{identifier}</strong>
                            </p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>
                                Mã xác nhận
                            </label>
                            <input
                                className="form-control verify-code-input"
                                type="text"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                required
                                maxLength={6}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>
                                Mật khẩu mới
                            </label>
                            <input
                                className="form-control"
                                type="password"
                                placeholder="Ít nhất 8 ký tự"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>
                                Nhập lại mật khẩu
                            </label>
                            <input
                                className="form-control"
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn btn-submit w-100" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                        </button>
                        <div className="d-flex justify-content-between mt-4">
                            <button type="button" className="btn btn-link p-0" style={{ color: '#00B4DB' }}
                                onClick={() => setStep(1)}>
                                Gửi lại mã
                            </button>
                            <a href="/login">Quay lại đăng nhập</a>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default ForgotPassword;
