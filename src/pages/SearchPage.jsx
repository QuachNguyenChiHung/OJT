import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Filter from "../Components/Filter";
import ProductTable from "../Components/ProductTable";

const SearchPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';

    // Live change handler (keeps compatibility with Filter's onFilterChange)
    const handleFilterChange = (filters) => {
        // For now, when user toggles filters live we won't immediately fetch; keep behaviour minimal
        // Optionally, you can call the same apply logic here.
        console.debug('live-filters', filters);
    };

    // When the URL query string changes (e.g. user clicked Apply), fetch results from backend
    useEffect(() => {
        let isMounted = true;
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchParam = q ? `?search=${encodeURIComponent(q)}` : '';
                const url = `/products/list${searchParam}`;
                const resp = await axios.get(import.meta.env.VITE_API_URL + url, { withCredentials: true });
                const data = resp?.data || [];

                // Map backend product shape to ProductTable expected shape
                const mapped = data.map(p => {
                    const name = p.name || p.productName || p.p_name || p.title || '';
                    const id = p.id ?? p.productId ?? p._id;
                    const priceNum = Number(p.price ?? p.priceNum ?? p.unitPrice ?? p.price_value ?? 0);
                    const image = p.image || p.imageUrl || p.thumbnail || '/img/clothes.png';
                    const onSale = Boolean(p.onSale || p.discount > 0 || p.sale);
                    return {
                        id,
                        name,
                        price: `${priceNum.toLocaleString('vi-VN')} đ`,
                        image,
                        onSale
                    };
                });

                if (isMounted) setResults(mapped);
            } catch (err) {
                console.error('Search fetch failed', err);
                if (isMounted) setError('Không thể tải kết quả. Vui lòng thử lại.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchResults();

        return () => { isMounted = false; };
    }, [location.search]);

    return <>
        <Filter onFilterChange={handleFilterChange} />
        <div className="container mt-3">
            <h5>Kết Quả Tìm Kiếm</h5>
            {loading && <div>Đang tải kết quả...</div>}
            {error && <div className="text-danger">{error}</div>}
            {!loading && !error && <ProductTable title="" data={results} pagination={false} />}
        </div>
    </>;
}

export default SearchPage;
