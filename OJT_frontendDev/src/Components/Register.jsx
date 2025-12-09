import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/theme.css';

const logoImg = '/img/logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showVerify, setShowVerify] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const navigate = useNavigate();

    // Field validation states (only username and phone)
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        phone: ''
    });
    const [fieldChecking, setFieldChecking] = useState({
        username: false,
        phone: false
    });

    // Check duplicate field (only username and phone)
    const checkDuplicate = useCallback(async (field, value) => {
        if (!value || value.length < 3) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
            return;
        }

        // Validate format first
        if (field === 'username') {
            const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
            if (!usernameRegex.test(value)) {
                setFieldErrors(prev => ({ ...prev, username: 'Username chỉ chứa chữ, số và dấu gạch dưới (3-30 ký tự)' }));
                return;
            }
        }

        if (field === 'phone') {
            const phoneRegex = /^[0-9]{9,11}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                setFieldErrors(prev => ({ ...prev, phone: 'Số điện thoại không hợp lệ' }));
                return;
            }
        }

        setFieldChecking(prev => ({ ...prev, [field]: true }));
        
        try {
            const res = await api.post('/auth/check-duplicate', { field, value });
            if (res.data.exists) {
                setFieldErrors(prev => ({ ...prev, [field]: res.data.message }));
            } else {
                setFieldErrors(prev => ({ ...prev, [field]: '' }));
            }
        } catch {
            // Silent fail for duplicate check
        } finally {
            setFieldChecking(prev => ({ ...prev, [field]: false }));
        }
    }, []);

    // Debounce timer refs
    const usernameTimerRef = useRef(null);
    const phoneTimerRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Trigger duplicate check for username and phone only (debounced)
        if (name === 'username') {
            if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
            usernameTimerRef.current = setTimeout(() => checkDuplicate('username', value), 500);
        } else if (name === 'phone') {
            if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current);
            phoneTimerRef.current = setTimeout(() => checkDuplicate('phone', value), 500);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            try {
                const res = await api.get('/auth/me');
                if (res?.data.role === 'ADMIN' || res?.data.role === 'EMPLOYEE') {
                    navigate('/admin/products');
                } else {
                    navigate('/home');
                }
            } catch { /* empty */ }
        };
        fetchCurrentUser();
    }, [navigate]);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType(null);

        // Check for field errors
        if (fieldErrors.username || fieldErrors.phone) {
            setMessage('Vui lòng sửa các lỗi trước khi đăng ký');
            setMessageType('error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage('Mật khẩu không khớp!');
            setMessageType('error');
            return;
        }
        if (formData.password.length < 8) {
            setMessage('Mật khẩu phải có ít nhất 8 ký tự!');
            setMessageType('error');
            return;
        }
        if (!formData.username || formData.username.length < 3) {
            setMessage('Username phải có ít nhất 3 ký tự!');
            setMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/signup', {
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            if (res.data.authType === 'cognito') {
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.');
                setMessageType('success');
                setShowVerify(true);
            } else {
                setMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
                setMessageType('success');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            const serverMsg = error?.response?.data?.error || error?.message || 'Lỗi máy chủ';
            setMessage(serverMsg);
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/verify', {
                username: formData.username,
                code: verifyCode
            });
            setMessage('Xác nhận thành công! Đang chuyển đến trang đăng nhập...');
            setMessageType('success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error?.response?.data?.error || 'Mã xác nhận không đúng');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Input field with validation indicator (only for username and phone)
    const renderValidatedInput = (name, label, type, options = {}) => {
        const hasError = fieldErrors[name];
        const isChecking = fieldChecking[name];
        const isValid = formData[name] && formData[name].length >= 3 && !hasError && !isChecking;
        
        return (
            <div className="mb-3">
                <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                    <input 
                        className={`form-control ${hasError ? 'is-invalid' : (isValid ? 'is-valid' : '')}`}
                        type={type} 
                        name={name} 
                        placeholder=""
                        value={formData[name]} 
                        onChange={handleChange} 
                        required 
                        {...options}
                    />
                    {isChecking && (
                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                            <span className="spinner-border spinner-border-sm text-secondary" />
                        </div>
                    )}
                </div>
                {hasError && (
                    <small className="text-danger">{hasError}</small>
                )}
            </div>
        );
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="text-center">
                    <img className="logo" src={logoImg} alt="Furious Five Fashion" />
                    <h4>{showVerify ? 'Xác Nhận Email' : 'Đăng Ký Tài Khoản'}</h4>
                </div>
                
                {message && (
                    <div className={messageType === 'error' ? 'alert-error-themed' : 'alert-success-themed'} 
                         style={{ marginBottom: '20px' }}>
                        {message}
                    </div>
                )}

                {!showVerify ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>Họ và tên</label>
                            <input className="form-control" type="text" name="fullName" placeholder=""
                                value={formData.fullName} onChange={handleChange} required />
                        </div>
                        
                        {renderValidatedInput('username', 'Username', 'text', { minLength: 3 })}
                        
                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>Email</label>
                            <input className="form-control" type="email" name="email" placeholder=""
                                value={formData.email} onChange={handleChange} required />
                        </div>
                        
                        {renderValidatedInput('phone', 'Số điện thoại', 'tel')}
                        
                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>Mật khẩu</label>
                            <input className="form-control" type="password" name="password" placeholder=""
                                value={formData.password} onChange={handleChange} required minLength={8} />
                            <small className="text-muted">Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</small>
                        </div>
                        <div className="mb-4">
                            <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>Nhập lại mật khẩu</label>
                            <input className="form-control" type="password" name="confirmPassword" placeholder=""
                                value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                        <button 
                            className="btn btn-submit w-100" 
                            type="submit" 
                            disabled={isSubmitting || fieldErrors.username || fieldErrors.phone}
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                        <div className="text-center mt-4">
                            <span style={{ color: '#666' }}>Đã có tài khoản? </span>
                            <a href="/login">Đăng nhập</a>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode}>
                        <div className="text-center mb-4">
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
                            <p style={{ color: '#666' }}>
                                Chúng tôi đã gửi mã xác nhận đến<br/>
                                <strong style={{ color: '#00B4DB' }}>{formData.email}</strong>
                            </p>
                        </div>
                        <div className="mb-4">
                            <input 
                                className="form-control verify-code-input" 
                                type="text" 
                                placeholder="000000"
                                value={verifyCode} 
                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))} 
                                required 
                                maxLength={6} 
                            />
                        </div>
                        <button className="btn btn-submit w-100" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xác nhận...' : 'Xác Nhận'}
                        </button>
                        <div className="text-center mt-3">
                            <button type="button" className="btn btn-link" style={{ color: '#00B4DB' }}
                                onClick={() => setShowVerify(false)}>
                                ← Quay lại
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default Register;
