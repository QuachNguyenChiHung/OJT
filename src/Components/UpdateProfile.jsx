import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpdateProfile = () => {
    const [formData, setFormData] = useState({
        u_id: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        age: '',
        dateOfBirth: ''
    });
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', {
                    withCredentials: true
                });
                const user = response.data;
                // Format date for input field (YYYY-MM-DD for HTML input, but we'll convert to dd/MM/yyyy for backend)
                let formattedDate = '';
                if (user.dateOfBirth || user.date_of_birth) {
                    const dateStr = user.dateOfBirth || user.date_of_birth;
                    if (dateStr) {
                        // If date comes from backend in dd/MM/yyyy format, convert to yyyy-MM-dd for input
                        if (dateStr.includes('/')) {
                            const [day, month, year] = dateStr.split('/');
                            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        } else {
                            // If it's already in ISO format
                            const date = new Date(dateStr);
                            formattedDate = date.toISOString().split('T')[0];
                        }
                    }
                }
                setFormData({
                    u_id: user.u_id || user.id || '',
                    fullName: user.fullName || user.u_name || '',
                    phoneNumber: user.phoneNumber || user.phone_number || '',
                    address: user.address || '',
                    age: user.age || '',
                    dateOfBirth: formattedDate
                });
            } catch (error) {
                console.error('Error loading user data:', error);
                setAlert({ type: 'danger', message: 'Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.' });
                navigate('/login');
            }
        };

        loadUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setLoading(true);

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
                setLoading(false);
                return;
            }
        }

        try {
            const updateData = {
                fullName: formData.fullName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                address: formData.address.trim(),
                dateOfBirth: formData.dateOfBirth.trim(),
            };

            // Only include dateOfBirth if it has a valid value, convert yyyy-MM-dd to dd/MM/yyyy
            if (formData.dateOfBirth && formData.dateOfBirth.trim() !== '') {
                // Convert from yyyy-MM-dd (HTML input format) to dd/MM/yyyy (backend format)
                const [year, month, day] = formData.dateOfBirth.split('-');
                updateData.dateOfBirth = `${day}/${month}/${year}`;
            }

            await axios.put(import.meta.env.VITE_API_URL + '/users/profile/' + formData.u_id, updateData, {
                withCredentials: true
            });

            setAlert({ type: 'success', message: 'Cập nhật thông tin thành công!' });

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setAlert({ type: 'danger', message: 'Cập nhật thông tin thất bại. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Cập nhật thông tin cá nhân</h2>
                            <p className="text-muted text-center mb-4">
                                Cập nhật thông tin tài khoản của bạn
                            </p>
                            {alert && (
                                <div className={`alert alert-${alert.type}`} role="alert">
                                    {alert.message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="fullName" className="form-label">Tên hiển thị</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="address" className="form-label">Địa chỉ</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-control"
                                        rows="3"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="dateOfBirth" className="form-label">Ngày sinh (18-100 tuổi)</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="form-control"
                                        min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                                        max={new Date(new Date().getFullYear() - 18, 11, 31).toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/')}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProfile;