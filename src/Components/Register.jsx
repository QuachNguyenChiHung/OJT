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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle registration logic here
        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu không khớp!');
            return;
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
                                    <div className="mb-3">
                                        <button
                                            className="btn d-block w-100 btn-warning text-white"
                                            type="submit"
                                        >
                                            Đăng Ký
                                        </button>
                                        <div className="d-flex">
                                            <p className="text-muted">Quên mật khẩu?&nbsp;</p>
                                            <a href="#">Nhấp vào đây để cài lại mật khẩu</a>
                                        </div>
                                        <div className="d-flex">
                                            <p className="text-muted">Đã có tài khoản?&nbsp;</p>
                                            <a href="#">Đăng nhập</a>
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