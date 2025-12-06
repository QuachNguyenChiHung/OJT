import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Filter from "../Components/Filter";
import ProductTable from "../Components/ProductTable";

const SearchPage = () => {
    const [allResults, setAllResults] = useState([]); // Store all results from backend
    const [filteredResults, setFilteredResults] = useState([]); // Store filtered results
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const sort = params.get('sort') || 'newest';
    const sizes = params.get('sizes') ? params.get('sizes').split(',') : [];
    const brands = params.get('brands') ? params.get('brands').split(',') : [];
    const colors = params.get('colors') ? params.get('colors').split(',') : [];

    // Apply filters to the results
    const applyFilters = (products, filters) => {
        let filtered = [...products];

        // Filter by sizes (if product has productDetails)
        if (filters.sizes.length > 0) {
            filtered = filtered.filter(product => {
                if (!product.productDetails || !Array.isArray(product.productDetails)) return false;
                return product.productDetails.some(detail =>
                    filters.sizes.includes(detail.size)
                );
            });
        }

        // Filter by brands
        if (filters.brands.length > 0) {
            filtered = filtered.filter(product =>
                filters.brands.includes(product.brand?.name || product.brandName)
            );
        }

        // Filter by colors
        if (filters.colors.length > 0) {
            filtered = filtered.filter(product => {
                if (!product.productDetails || !Array.isArray(product.productDetails)) return false;
                return product.productDetails.some(detail =>
                    filters.colors.includes(detail.colorName)
                );
            });
        }

        // Apply sorting
        switch (filters.sort) {
            case 'asc':
                filtered.sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
                break;
            case 'desc':
                filtered.sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
        }

        return filtered;
    };

    // Live change handler (keeps compatibility with Filter's onFilterChange)
    const handleFilterChange = useCallback((filters) => {
        // Apply filters immediately to current results
        if (allResults.length > 0) {
            const filtered = applyFilters(allResults, filters);
            const mapped = mapProductsForDisplay(filtered);
            setFilteredResults(mapped);
        }
    }, [allResults]);

    // Map backend products to display format
    const mapProductsForDisplay = (products) => {
        return products.map(p => {
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
                onSale,
                priceNum // Keep for sorting
            };
        });
    };

    // When the URL query string changes, fetch results from backend
    useEffect(() => {
        let isMounted = true;
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            setFilteredResults([]); // Clear previous results immediately
            try {
                const searchParam = q ? `?search=${encodeURIComponent(q)}` : '';
                const url = `/products/list${searchParam}`;
                const resp = await axios.get(import.meta.env.VITE_API_URL + url, { withCredentials: true });
                const data = resp?.data || [];

                if (isMounted) {
                    setAllResults(data); // Store raw data for filtering

                    // Apply current filters
                    const currentFilters = {
                        sizes,
                        brands,
                        colors,
                        sort
                    };
                    const filtered = applyFilters(data, currentFilters);
                    const mapped = mapProductsForDisplay(filtered);
                    setFilteredResults(mapped);
                }
            } catch (err) {
                console.error('Search fetch failed', err);
                if (isMounted) setError('Không thể tải kết quả. Vui lòng thử lại.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchResults();

        return () => { isMounted = false; };
    }, [location.search]); // Re-fetch when any URL parameter changes

    return <>
        <Filter onFilterChange={handleFilterChange} />
        <div className="container mt-3">
            <h5>Kết Quả Tìm Kiếm {q && `cho "${q}"`}</h5>
            {loading && <div className="text-center py-3">Đang tải kết quả...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
                <>
                    <div className="mb-3 text-muted">
                        Tìm thấy {filteredResults.length} sản phẩm
                        {(sizes.length > 0 || brands.length > 0 || colors.length > 0) && (
                            <div className="mt-2">
                                <small>Bộ lọc đang áp dụng: </small>
                                {sizes.length > 0 && <span className="badge bg-secondary me-1">Size: {sizes.join(', ')}</span>}
                                {brands.length > 0 && <span className="badge bg-secondary me-1">Thương hiệu: {brands.join(', ')}</span>}
                                {colors.length > 0 && <span className="badge bg-secondary me-1">Màu: {colors.join(', ')}</span>}
                            </div>
                        )}
                    </div>
                    <ProductTable title="" data={filteredResults} pagination={true} />
                </>
            )}
        </div>
    </>;
}

export default SearchPage;
