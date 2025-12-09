import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderRow = memo(({
    order,
    editingId,
    editingStatus,
    setEditingStatus,
    statuses,
    getStatusBadge,
    formatDate,
    formatCurrency,
    startEdit,
    saveEdit,
    cancelEdit
}) => {
    const navigate = useNavigate();

    const isEditing = editingId === order.id;

    return (
        <tr>
            <td>
                <small className="text-monospace">{order.id.substring(0, 8)}...</small>
            </td>
            <td>
                <small className="text-monospace">{order.userId.substring(0, 8)}...</small>
            </td>
            <td>
                {isEditing ? (
                    <select
                        className="form-select form-select-sm"
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value)}
                        autoFocus
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'PENDING' && 'Chờ Xử Lý'}
                                {status === 'PROCESSING' && 'Đang Xử Lý'}
                                {status === 'SHIPPING' && 'Đang Giao'}
                                {status === 'DELIVERED' && 'Đã Giao'}
                                {status === 'CANCELLED' && 'Đã Hủy'}
                            </option>
                        ))}
                    </select>
                ) : (
                    getStatusBadge(order.status)
                )}
            </td>
            <td>{formatDate(order.dateCreated)}</td>
            <td className="fw-bold">{formatCurrency(order.total)}</td>
            <td className="text-center">{order.itemCount}</td>
            <td>
                <div className="d-flex gap-1">
                    {isEditing ? (
                        <>
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => saveEdit(order.id)}
                                title="Lưu thay đổi"
                            >
                                Lưu
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEdit}
                                title="Hủy thay đổi"
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                title="Xem chi tiết"
                            >
                                Chi Tiết
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => startEdit(order)}
                                title="Sửa trạng thái"
                            >
                                Sửa
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
});

OrderRow.displayName = 'OrderRow';

export default OrderRow;