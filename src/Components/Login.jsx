import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const logoImg = '/img/logo.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [currentUser, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
            setCurrentUser(res.data);
            // If required profile fields are missing, send user to EnterInfo
            const missingPhone = !res.data.phoneNumber;
            const missingUname = !res.data.fullName;
            if (missingPhone || missingUname) {
                navigate('/enter-info');
                return;
            }

            // Otherwise redirect based on role
            if (res?.data.role === 'ADMIN' || res?.data.role === 'EMPLOYEE') {
                navigate('/admin/products');
                return;
            } else {
                navigate('/');
                return;
            }

        } catch (error) {
        }
    }
    useEffect(() => {
        fetchCurrentUser();
    }, []);
    const [alertType, setAlert] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const success_login_alert = () => {
        return (
            <Alert variant="success" dismissible>
                Đăng nhập thành công! Đang chuyển hướng...
            </Alert>
        )
    }

    const failed_login_alert = () => {
        return (
            <>
                <Alert variant="danger" dismissible>
                    Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.
                </Alert>
            </>
        )
    }
    const failed_server_alert = () => {

        return (
            <>
                <Alert variant="danger" dismissible>
                    Lỗi máy chủ. Vui lòng thử lại sau.
                </Alert>
            </>
        )
    }
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAlert(''); // Clear any previous alerts

        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', formData, {
                withCredentials: true
            });

            // If login successful, show success message
            if (response.status === 200) {
                setAlert('success_login');
                // Wait a bit to show the success message before redirecting
                setTimeout(() => {
                    fetchCurrentUser();
                }, 1000);
            }
        } catch (error) {
            console.log(error.response?.status);
            if (error.response?.status === 401) {
                setAlert('failed_login');
            } else {
                setAlert('failed_server');
            }
            setIsLoading(false);
        }
    };
    return (
        <>
            {alertType === 'success_login' && success_login_alert()}
            {alertType === 'failed_login' && failed_login_alert()}
            {alertType === 'failed_server' && failed_server_alert()}
            <section
                className="d-flex align-items-center py-4 py-xl-5"
                style={{ height: '100vh', width: '100vw' }}
            >

                <div className="container">
                    <div className="row d-flex justify-content-center">
                        <div className="col-md-6 col-xl-4">
                            <div
                                className="card mb-5"
                                style={{
                                    padding: '1rem',
                                    borderWidth: '3px',
                                    borderColor: '#06BAE9',
                                    paddingBottom: 0
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-center ">
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
                                            <button
                                                className="btn d-block w-100 meme text-white"
                                                type="submit"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                            </button>
                                            <div className="d-flex">
                                                <p className="text-muted">Chưa có tài khoản?&nbsp;</p>
                                                <a href="/register">Đăng kí</a>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>

    );
};

export default Login;