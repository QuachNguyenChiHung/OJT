import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ReviewPage() {
    const { productId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    const [product, setProduct] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingRating, setExistingRating] = useState(null);

    useEffect(() => {
        const fetchProductAndRating = async () => {
        try {
            setLoading(true);
            // Fetch product info - try multiple endpoints
            let productData = null;
            try {
                const productRes = await api.get(`/products/${productId}`);
                productData = productRes.data;
            } catch {
                // Try product-details endpoint as fallback
                try {
                    const pdRes = await api.get(`/product-details/product/${productId}`);
                    const details = pdRes.data?.[0] || pdRes.data;
                    if (details) {
                        productData = {
                            name: details.productName || details.p_name,
                            price: details.price,
                            imageUrl: details.imgList?.[0] || details.imageUrl || ''
                        };
                    }
                } catch {
                    // Ignore
                }
            }
            setProduct(productData);

            // Check if user already rated this product
            try {
                const ratingRes = await api.get(`/ratings/check?productId=${productId}`);
                if (ratingRes.data?.rating) {
                    setExistingRating(ratingRes.data.rating);
                    setRating(ratingRes.data.rating.ratingValue || 5);
                    setComment(ratingRes.data.rating.comment || '');
                }
            } catch {
                // No existing rating - ignore
            }
        } catch (err) {
            console.error('Fetch product error:', err);
        } finally {
            setLoading(false);
        }
        };
        fetchProductAndRating();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating < 1 || rating > 5) {
            alert('Vui lòng chọn số sao từ 1-5');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/ratings', {
                productId,
                ratingValue: rating,
                comment: comment.trim()
            });
            alert('✅ Cảm ơn bạn đã đánh giá sản phẩm!');
            navigate(orderId ? `/orders?orderId=${orderId}` : '/orders');
        } catch (err) {
            console.error('Submit rating error:', err);
            alert('Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                style={{
                    fontSize: '40px',
                    cursor: 'pointer',
                    color: star <= (hoveredStar || rating) ? '#fbbf24' : '#d1d5db',
                    transition: 'color 0.15s, transform 0.15s',
                    transform: star <= (hoveredStar || rating) ? 'scale(1.1)' : 'scale(1)',
                }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
            >
                ★
            </span>
        ));
    };

    const getRatingText = (value) => {
        const texts = {
            1: 'Rất tệ 😞',
            2: 'Tệ 😕',
            3: 'Bình thường 😐',
            4: 'Tốt 😊',
            5: 'Tuyệt vời 🤩'
        };
        return texts[value] || '';
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status"></div>
                <p className="mt-3">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="container py-4" style={{ maxWidth: 600 }}>
            <button
                className="btn btn-link text-decoration-none mb-3 p-0"
                onClick={() => navigate(-1)}
            >
                ← Quay lại
            </button>

            <div className="card shadow-sm">
                <div className="card-body p-4">
                    <h4 className="mb-4 text-center">
                        {existingRating ? 'Cập nhật đánh giá' : 'Đánh giá sản phẩm'}
                    </h4>

                    {/* Product Info */}
                    {product && (
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
                            <div style={{ width: 80, height: 80, borderRadius: 8, background: '#e5e5e5', overflow: 'hidden', flexShrink: 0 }}>
                                {(product.imageUrl || product.thumbnail || product.image) ? (
                                    <img
                                        src={product.imageUrl || product.thumbnail || product.image}
                                        alt={product.name || product.p_name || 'Product'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>No img</div>
                                )}
                            </div>
                            <div>
                                <h6 className="mb-1">{product.name || product.p_name || 'Sản phẩm'}</h6>
                                {product.price && (
                                    <small className="text-muted">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </small>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Star Rating */}
                        <div className="text-center mb-4">
                            <label className="form-label fw-bold mb-2">Chất lượng sản phẩm</label>
                            <div className="d-flex justify-content-center gap-1 mb-2">
                                {renderStars()}
                            </div>
                            <div style={{ color: '#f59e0b', fontWeight: 500 }}>
                                {getRatingText(hoveredStar || rating)}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Nhận xét của bạn</label>
                            <textarea
                                className="form-control"
                                rows={4}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn btn-warning w-100 py-2"
                            disabled={submitting}
                            style={{ fontWeight: 600 }}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Đang gửi...
                                </>
                            ) : existingRating ? (
                                '✏️ Cập nhật đánh giá'
                            ) : (
                                '⭐ Gửi đánh giá'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
