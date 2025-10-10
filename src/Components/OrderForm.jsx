import React, { useState } from 'react';

export default function OrderForm() {
    const [form, setForm] = useState({
        phone: '',
        u_name: '',
        address: '',
        date_of_birth: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const validate = () => {
        const err = {};
        if (!form.u_name.trim()) err.u_name = 'Tên người dùng là bắt buộc';
        if (!form.phone.trim()) err.phone = 'Số điện thoại là bắt buộc';
        // basic phone pattern (digits, spaces, +, -)
        if (form.phone && !/^[+()0-9\s-]{7,20}$/.test(form.phone)) err.phone = 'Số điện thoại không hợp lệ';
        if (!form.address.trim()) err.address = 'Địa chỉ là bắt buộc';
        if (!form.date_of_birth) err.date_of_birth = 'Ngày sinh là bắt buộc';
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        // For now just log and show an alert. Replace with API call as needed.
        console.log('Submitted form', form);
        alert(`Gửi thành công:\nTên: ${form.u_name}\nSĐT: ${form.phone}\nĐịa chỉ: ${form.address}\nNgày sinh: ${form.date_of_birth}`);
        setForm({ phone: '', u_name: '', address: '', date_of_birth: '' });
        setErrors({});
    };

    // Simple orange theme styles (inline so no extra css file required)
    const wrapperStyle = {
        background: '#fff7f0',
        border: '3px solid rgb(228, 148, 0)',
        padding: '1.25rem',
        borderRadius: '6px',
        maxWidth: 640,
        margin: '1.5rem auto'
    };

    const labelStyle = { fontWeight: 600, color: '#333' };
    const inputStyle = { borderColor: 'rgb(228, 148, 0)' };

    return (
        <div style={wrapperStyle}>
            <h2 style={{ marginBottom: '0.75rem' }}>Thông tin liên hệ</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="u_name" style={labelStyle} className="form-label">Tên người dùng</label>
                    <input
                        id="u_name"
                        name="u_name"
                        className="form-control"
                        value={form.u_name}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập tên của bạn"
                    />
                    {errors.u_name && <div className="form-text text-danger">{errors.u_name}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="phone" style={labelStyle} className="form-label">Số điện thoại</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Ví dụ: +84 912 345 678"
                    />
                    {errors.phone && <div className="form-text text-danger">{errors.phone}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="address" style={labelStyle} className="form-label">Địa chỉ</label>
                    <textarea
                        id="address"
                        name="address"
                        className="form-control"
                        value={form.address}
                        onChange={handleChange}
                        style={{ ...inputStyle, minHeight: 80 }}
                        placeholder="Nhập địa chỉ giao hàng"
                    />
                    {errors.address && <div className="form-text text-danger">{errors.address}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="date_of_birth" style={labelStyle} className="form-label">Ngày sinh</label>
                    <input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        className="form-control"
                        value={form.date_of_birth}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                    {errors.date_of_birth && <div className="form-text text-danger">{errors.date_of_birth}</div>}
                </div>

                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-orange" style={{ background: 'rgb(228, 148, 0)', color: 'white', borderRadius: 0, border: '2px solid rgb(228, 148, 0)', padding: '0.5rem 1.25rem' }}>
                        Gửi
                    </button>
                </div>
            </form>
        </div>
    );
}
