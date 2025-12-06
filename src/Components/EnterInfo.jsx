import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EnterInfo = () => {
    const [formData, setFormData] = useState({
        u_id: '',
        dateOfBirth: '',
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
                    u_id: u.u_id || u.id || '',
                    date_of_birth: u.date_of_birth || u.dateOfBirth || '',
                    phone_number: u.phoneNumber || u.phone_number || u.phone || '',
                    address: u.address || '',
                    u_name: u.u_name || u.username || u.fullName || '',
                    age: u.age || ''
                });
            } catch (err) {
                navigate('/login');
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

        // Validate age if dateOfBirth is provided
        if (formData.dateOfBirth && formData.dateOfBirth.trim() !== '') {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Adjust age if birthday hasn't occurred this year
            const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
                ? age - 1 : age;

            if (actualAge < 18 || actualAge > 100) {
                setAlert({ type: 'danger', message: 'Tuổi phải từ 18 đến 100 tuổi.' });
                return;
            }
        }

        try {
            // Update profile - using PATCH on /auth/me (adjust if your API differs)
            await axios.put(import.meta.env.VITE_API_URL + '/users/profile/' + formData.u_id, {
                phoneNumber: formData.phone_number,
                address: formData.address,
                fullName: formData.u_name,
                dateOfBirth: formData.dateOfBirth
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
                                        <label className="form-label">Ngày sinh (18-100 tuổi)</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                                            max={new Date(new Date().getFullYear() - 18, 11, 31).toISOString().split('T')[0]}
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