import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EnterInfo = () => {
    const [formData, setFormData] = useState({
        date_of_birth: '',
        phone_number: '',
        address: '',
        u_name: '',
        age: ''
    });
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    // Pre-fill from /auth/me if available
    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
                const u = res.data || {};
                setFormData({
                    date_of_birth: u.date_of_birth || u.dateOfBirth || '',
                    phone_number: u.phoneNumber || u.phone_number || u.phone || '',
                    address: u.address || '',
                    u_name: u.u_name || u.username || u.fullName || '',
                    age: u.age || ''
                });
            } catch (err) {
                // ignore - user may not be logged in
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        try {
            // Update profile - using PATCH on /auth/me (adjust if your API differs)
            await axios.put(import.meta.env.VITE_API_URL + 'users/' + formData.u_id, {
                date_of_birth: formData.date_of_birth,
                phoneNumber: formData.phone_number,
                address: formData.address,
                u_name: formData.u_name,
                age: formData.age
            }, { withCredentials: true });

            // Re-fetch user to determine role and redirect
            const me = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
            const role = me?.data?.role;
            if (role === 'ADMIN' || role === 'EMPLOYEE') {
                navigate('/admin/products');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setAlert({ type: 'danger', message: 'Lưu thông tin thất bại. Vui lòng thử lại.' });
        }
    };

    return (
        <section className="d-flex align-items-center py-4 py-xl-5" style={{ minHeight: '80vh' }}>
            <div className="container">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-8 col-xl-6">
                        <div className="card mb-5" style={{ padding: '1rem' }}>
                            <div className="card-body">
                                <h3 className="mb-3">Hoàn thiện thông tin</h3>
                                {alert && (
                                    <Alert variant={alert.type}>{alert.message}</Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Tên hiển thị</label>
                                        <input
                                            className="form-control"
                                            name="u_name"
                                            value={formData.u_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Ngày sinh</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tuổi</label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            min="1"
                                            max="150"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Số điện thoại</label>
                                        <input
                                            className="form-control"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Địa chỉ</label>
                                        <input
                                            className="form-control"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-primary" type="submit">Lưu</button>
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

export default EnterInfo;