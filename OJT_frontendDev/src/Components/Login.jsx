import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/theme.css';

const logoImg = '/img/logo.png';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const res = await api.get('/auth/me');
            
            const missingPhone = !res.data.phoneNumber;
            const missingUname = !res.data.fullName;
            if (missingPhone || missingUname) {
                navigate('/enter-info');
                return;
            }

            if (res?.data.role === 'ADMIN' || res?.data.role === 'EMPLOYEE') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } catch (error) {}
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await api.post('/auth/login', {
                identifier: formData.identifier,
                password: formData.password
            });

            if (response.status === 200) {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    if (response.data.accessToken) {
                        localStorage.setItem('accessToken', response.data.accessToken);
                    }
                    if (response.data.refreshToken) {
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                    }
                }
                setMessage('Đăng nhập thành công!');
                setMessageType('success');
                setTimeout(() => fetchCurrentUser(), 1000);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setMessage('Sai email/username hoặc mật khẩu');
            } else {
                setMessage('Lỗi máy chủ. Vui lòng thử lại sau.');
            }
            setMessageType('error');
            setIsLoading(false);
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="text-center">
                    <img className="logo" src={logoImg} alt="Furious Five Fashion" />
                    <h4>Đăng Nhập</h4>
                </div>

                {message && (
                    <div className={messageType === 'error' ? 'alert-error-themed' : 'alert-success-themed'} 
                         style={{ marginBottom: '20px' }}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>
                            Email hoặc Username
                        </label>
                        <input
                            className="form-control"
                            type="text"
                            name="identifier"
                            placeholder="Nhập email hoặc username"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label" style={{ fontWeight: '500', color: '#555' }}>
                            Mật khẩu
                        </label>
                        <input
                            className="form-control"
                            type="password"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="btn btn-submit w-100" type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                    
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>
                            <span style={{ color: '#666' }}>Chưa có tài khoản? </span>
                            <a href="/register">Đăng ký</a>
                        </div>
                        <a href="/forgot-password">Quên mật khẩu?</a>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;
