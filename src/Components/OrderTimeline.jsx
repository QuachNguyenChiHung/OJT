import { useMemo } from 'react';

// Order status timeline component
export default function OrderTimeline({ status, dateCreated }) {
    const statuses = useMemo(() => [
        { key: 'PENDING', label: 'Chờ xử lý', icon: '📋', description: 'Đơn hàng đã được tạo' },
        { key: 'PROCESSING', label: 'Đang xử lý', icon: '⚙️', description: 'Đơn hàng đang được chuẩn bị' },
        { key: 'SHIPPING', label: 'Đang giao', icon: '🚚', description: 'Đơn hàng đang được vận chuyển' },
        { key: 'DELIVERED', label: 'Đã giao', icon: '✅', description: 'Đơn hàng đã giao thành công' }
    ], []);

    const cancelledStatus = { key: 'CANCELLED', label: 'Đã hủy', icon: '❌', description: 'Đơn hàng đã bị hủy' };

    const currentIndex = statuses.findIndex(s => s.key === status);
    const isCancelled = status === 'CANCELLED';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(typeof dateString === 'number' ? dateString * 1000 : dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <h6 style={{ 
                marginBottom: '20px', 
                color: '#333', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span>📦</span> Trạng thái đơn hàng
            </h6>

            {isCancelled ? (
                // Cancelled order display
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#fef2f2',
                    borderRadius: '12px',
                    border: '1px solid #fecaca'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                    }}>
                        {cancelledStatus.icon}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', color: '#dc2626', fontSize: '15px' }}>
                            {cancelledStatus.label}
                        </div>
                        <div style={{ fontSize: '13px', color: '#991b1b' }}>
                            {cancelledStatus.description}
                        </div>
                    </div>
                </div>
            ) : (
                // Normal timeline
                <div style={{ position: 'relative' }}>
                    {statuses.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const isLast = index === statuses.length - 1;

                        return (
                            <div key={step.key} style={{ display: 'flex', marginBottom: isLast ? 0 : '8px' }}>
                                {/* Timeline line and dot */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    marginRight: '16px'
                                }}>
                                    {/* Dot */}
                                    <div style={{
                                        width: isCurrent ? '40px' : '32px',
                                        height: isCurrent ? '40px' : '32px',
                                        borderRadius: '50%',
                                        background: isCompleted 
                                            ? (isCurrent ? 'linear-gradient(135deg, #00B4DB, #0083B0)' : '#10b981')
                                            : '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isCurrent ? '18px' : '14px',
                                        boxShadow: isCurrent ? '0 4px 12px rgba(0, 180, 219, 0.4)' : 'none',
                                        transition: 'all 0.3s ease',
                                        border: isCurrent ? '3px solid #fff' : 'none'
                                    }}>
                                        {isCompleted ? step.icon : '○'}
                                    </div>
                                    
                                    {/* Line */}
                                    {!isLast && (
                                        <div style={{
                                            width: '3px',
                                            height: '40px',
                                            background: index < currentIndex ? '#10b981' : '#e5e7eb',
                                            borderRadius: '2px'
                                        }} />
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ 
                                    flex: 1, 
                                    paddingTop: isCurrent ? '6px' : '4px',
                                    paddingBottom: '8px'
                                }}>
                                    <div style={{
                                        fontWeight: isCurrent ? '600' : '500',
                                        color: isCompleted ? '#111' : '#9ca3af',
                                        fontSize: isCurrent ? '15px' : '14px',
                                        marginBottom: '2px'
                                    }}>
                                        {step.label}
                                        {isCurrent && (
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                background: 'linear-gradient(135deg, #00B4DB, #0083B0)',
                                                color: '#fff',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                Hiện tại
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: isCompleted ? '#6b7280' : '#d1d5db'
                                    }}>
                                        {step.description}
                                    </div>
                                    {index === 0 && dateCreated && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#9ca3af',
                                            marginTop: '4px'
                                        }}>
                                            {formatDate(dateCreated)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Progress bar */}
            {!isCancelled && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Tiến độ đơn hàng</span>
                        <span style={{ fontSize: '12px', color: '#00B4DB', fontWeight: '600' }}>
                            {Math.round(((currentIndex + 1) / statuses.length) * 100)}%
                        </span>
                    </div>
                    <div style={{
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${((currentIndex + 1) / statuses.length) * 100}%`,
                            background: 'linear-gradient(90deg, #10b981, #00B4DB)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}
