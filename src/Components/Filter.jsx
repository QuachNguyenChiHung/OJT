import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Filter = ({ onFilterChange }) => {
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

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleCheckboxChange = (value, setter, currentArray) => {
        if (currentArray.includes(value)) {
            setter(currentArray.filter(item => item !== value));
        } else {
            setter([...currentArray, value]);
        }
    };

    useEffect(() => {
        if (typeof onFilterChange === 'function') {
            onFilterChange({
                q: searchQuery,
                sortBy,
                sizes: selectedSizes,
                brands: selectedBrands,
                colors: selectedColors
            });
        }
    }, [searchQuery, sortBy, selectedSizes, selectedBrands, selectedColors]); // Removed onFilterChange from dependencies

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

    return (
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
    );
};

export default Filter;