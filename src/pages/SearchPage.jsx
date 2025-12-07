import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductTable from "../Components/ProductTable";

const SearchPage = () => {
    const [allResults, setAllResults] = useState([]); // Store all results from backend
    const [filteredResults, setFilteredResults] = useState([]); // Store filtered results
    const [bestSellingIds, setBestSellingIds] = useState(new Set()); // Store best-selling product IDs
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states - moved from Filter component
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();

    // Initialize filter values from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchQuery(params.get('q') || '');
        setSortBy(params.get('sort') || 'newest');
        setSelectedSizes(params.get('sizes') ? params.get('sizes').split(',') : []);
        setSelectedBrands(params.get('brands') ? params.get('brands').split(',') : []);
        setSelectedColors(params.get('colors') ? params.get('colors').split(',') : []);
    }, [location.search]);

    // Fetch best-selling products to mark them with sale tags
    useEffect(() => {
        const fetchBestSelling = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL + '/products/best-selling');
                const bestSellingProductIds = new Set(response.data.map(product => product.id));
                setBestSellingIds(bestSellingProductIds);
            } catch (error) {
                console.error('Failed to fetch best-selling products:', error);
            }
        };
        fetchBestSelling();
    }, []);

    // Apply filters when sort or filter states change
    useEffect(() => {
        if (allResults.length > 0) {
            const filters = {
                sizes: selectedSizes,
                brands: selectedBrands,
                colors: selectedColors
            };
            const filtered = applyFilters(allResults, filters);
            const mapped = mapProductsForDisplay(filtered);
            const sorted = applySorting(mapped, sortBy);
            setFilteredResults(sorted);
        }
    }, [sortBy, selectedSizes, selectedBrands, selectedColors, allResults]);

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

        return filtered;
    };

    // Apply sorting to mapped products (after mapping to ensure priceNum exists)
    const applySorting = (mappedProducts, sortType) => {
        const sorted = [...mappedProducts];

        switch (sortType) {
            case 'asc':
                sorted.sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
                break;
            case 'desc':
                sorted.sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
                break;
            case 'popular':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
        }

        return sorted;
    };

    // Live change handler (keeps compatibility with Filter's onFilterChange)
    const handleFilterChange = useCallback((filters) => {
        // Apply filters immediately to current results
        if (allResults.length > 0) {
            const filtered = applyFilters(allResults, filters);
            const mapped = mapProductsForDisplay(filtered);
            const sorted = applySorting(mapped, sortBy);
            setFilteredResults(sorted);
        }
    }, [allResults, sortBy]); // Removed mapProductsForDisplay from dependencies

    // Filter functions - moved from Filter component
    const handleSortChange = (e) => {
        const newSortBy = e.target.value;
        setSortBy(newSortBy);

        // Immediately update URL and apply filters
        const params = new URLSearchParams(location.search);
        params.set('sort', newSortBy);
        navigate(`/search?${params.toString()}`, { replace: true });
    };

    const handleCheckboxChange = (value, setter, currentArray) => {
        if (currentArray.includes(value)) {
            setter(currentArray.filter(item => item !== value));
        } else {
            setter([...currentArray, value]);
        }
    };

    const handleApply = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (sortBy) params.set('sort', sortBy);
        if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
        if (selectedBrands.length) params.set('brands', selectedBrands.join(','));
        if (selectedColors.length) params.set('colors', selectedColors.join(','));

        // Navigate to /search with the query string
        navigate(`/search?${params.toString()}`);
    };

    // Map backend products to display format
    const mapProductsForDisplay = useCallback((products) => {
        return products.map(p => {
            const name = p.name || p.productName || p.p_name || p.title || '';
            const id = p.id ?? p.productId ?? p._id;
            const priceNum = Number(p.price ?? p.priceNum ?? p.unitPrice ?? p.price_value ?? 0);
            const image = p.image || p.imageUrl || p.thumbnail || '/img/clothes.png';
            // Check if product is best-selling or has existing sale status
            const onSale = Boolean(p.onSale || p.discount > 0 || p.sale || bestSellingIds.has(id));
            return {
                id,
                name,
                price: `${priceNum.toLocaleString('vi-VN')} đ`,
                image,
                onSale,
                priceNum // Keep for sorting
            };
        });
    }, [bestSellingIds]);

    // When the URL query string changes, fetch results from backend
    useEffect(() => {
        let isMounted = true;
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            setFilteredResults([]); // Clear previous results immediately
            try {
                const searchParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
                const url = `/products/list${searchParam}`;
                const resp = await axios.get(import.meta.env.VITE_API_URL + url, { withCredentials: true });
                const data = resp?.data || [];

                if (isMounted) {
                    setAllResults(data); // Store raw data for filtering

                    // Apply current filters
                    const currentFilters = {
                        sizes: selectedSizes,
                        brands: selectedBrands,
                        colors: selectedColors
                    };
                    const filtered = applyFilters(data, currentFilters);
                    const mapped = mapProductsForDisplay(filtered);
                    const sorted = applySorting(mapped, sortBy);
                    setFilteredResults(sorted);
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
    }, [searchQuery]); // Only depend on search query for fetching

    return <>
        {/* Filter section - moved from Filter component */}
        <section className="bg-light py-3">
            <div className="container">
                <div className="row">
                    {/* Sort */}
                    <div className="col-md-2 mb-3">
                        <label className="form-label fw-bold">Sắp xếp theo</label>
                        <select className="form-select" value={sortBy} onChange={handleSortChange}>
                            <option value="newest">Mới nhất</option>
                            <option value="popular">Phổ biến</option>
                            <option value="asc">Giá từ thấp đến cao</option>
                            <option value="desc">Giá từ cao đến thấp</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(selectedSizes.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0) && (
                    <div className="row mt-2">
                        <div className="col-12">
                            <small className="text-muted">Bộ lọc đang áp dụng: </small>
                            {selectedSizes.length > 0 && (
                                <span className="badge bg-secondary me-1">Size: {selectedSizes.join(', ')}</span>
                            )}
                            {selectedBrands.length > 0 && (
                                <span className="badge bg-secondary me-1">Thương hiệu: {selectedBrands.join(', ')}</span>
                            )}
                            {selectedColors.length > 0 && (
                                <span className="badge bg-secondary me-1">Màu: {selectedColors.join(', ')}</span>
                            )}
                            <button
                                className="btn btn-link btn-sm p-0 ms-2"
                                onClick={() => {
                                    setSelectedSizes([]);
                                    setSelectedBrands([]);
                                    setSelectedColors([]);
                                    navigate('/search' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''));
                                }}
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>

        <div className="container mt-3">
            <h5>Kết Quả Tìm Kiếm {searchQuery && `cho "${searchQuery}"`}</h5>
            {loading && <div className="text-center py-3">Đang tải kết quả...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
                <>
                    <div className="mb-3 text-muted">
                        Tìm thấy {filteredResults.length} sản phẩm
                        {(selectedSizes.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0) && (
                            <div className="mt-2">
                                <small>Bộ lọc đang áp dụng: </small>
                                {selectedSizes.length > 0 && <span className="badge bg-secondary me-1">Size: {selectedSizes.join(', ')}</span>}
                                {selectedBrands.length > 0 && <span className="badge bg-secondary me-1">Thương hiệu: {selectedBrands.join(', ')}</span>}
                                {selectedColors.length > 0 && <span className="badge bg-secondary me-1">Màu: {selectedColors.join(', ')}</span>}
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
