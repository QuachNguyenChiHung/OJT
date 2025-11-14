import axios from 'axios';
import React, { useState } from 'react';

const logoImg = '/img/logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(null); // 'error' | 'success'
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType(null);

        // Client-side validation
        if (formData.password !== formData.confirmPassword) {
            setMessage('Mật khẩu không khớp!');
            setMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                email: formData.email,
                password: formData.password
            }, { withCredentials: true });

            // Assuming success status codes 2xx
            setMessage('Đăng ký thành công!, vui lòng đăng nhập.');
            setMessageType('success');
            setFormData({ email: '', password: '', confirmPassword: '' });
        } catch (error) {
            // Show specific message for HTTP 409 (conflict / already exists)
            if (error?.response?.status === 409) {
                setMessage('Email đã được đăng ký');
            } else {
                // Show server error message if available
                const serverMsg = error?.response?.data?.message || error?.message || 'Lỗi máy chủ. Vui lòng thử lại sau.';
                setMessage(serverMsg);
            }
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }

        console.log('Register attempt:', formData);
    };

    return (
        <section
            className="d-flex align-items-center py-4 py-xl-5"
            style={{ height: '100vh ', width: '100vw ' }}
        >
            <div className="container">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6 col-xl-4">
                        <div
                            className="card mb-5"
                            style={{
                                padding: '1rem',
                                borderWidth: '3px',
                                borderColor: 'rgb(228, 148, 0)',
                                paddingBottom: 0
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <img className="logo" src={logoImg} alt="Logo" />
                            </div>
                            <div
                                className="card-body d-flex flex-column align-items-center"
                                style={{ paddingLeft: 0, paddingBottom: 0 }}
                            >
                                <form
                                    className="text-center"
                                    method="post"
                                    style={{ width: '100%' }}
                                    onSubmit={handleSubmit}
                                >
                                    <div className="mb-3">
                                        <input
                                            className="form-control"
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            className="form-control"
                                            type="password"
                                            name="password"
                                            placeholder="Mật khẩu"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            className="form-control"
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Nhập lại mật khẩu"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        {message && (
                                            <div
                                                role="alert"
                                                style={{
                                                    color: messageType === 'error' ? '#a94442' : '#155724',
                                                    backgroundColor: messageType === 'error' ? '#f8d7da' : '#d4edda',
                                                    border: `1px solid ${messageType === 'error' ? '#f5c6cb' : '#c3e6cb'}`,
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.75rem'
                                                }}
                                            >
                                                {message}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <button
                                            className="btn d-block w-100 btn-warning text-white"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Đang gửi...' : 'Đăng Ký'}
                                        </button>

                                        <div className="d-flex">
                                            <p className="text-muted">Đã có tài khoản?&nbsp;</p>
                                            <a href="/login">Đăng nhập</a>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;