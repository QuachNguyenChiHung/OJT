import React, { useState } from 'react';

const Filter = () => {
    const [sortBy, setSortBy] = useState('newest');
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

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

    return (
        <section className="d-flex justify-content-center mt-3">
            <div
                className="d-block d-md-flex justify-content-around"
                style={{ maxWidth: '1200px', width: '100%' }}
            >
                <div className="d-flex align-items-center ">
                    <p style={{ marginBottom: 0 }}>Sắp xếp theo&nbsp;</p>
                    <select value={sortBy} onChange={handleSortChange}>
                        <option value="desc">Giá từ cao đến thấp</option>
                        <option value="asc">Giá từ thấp đến cao</option>
                        <option value="popular">Phố biến</option>
                        <option value="newest">Mới nhất</option>
                    </select>
                </div>
                <div>
                    <p style={{ marginBottom: 0 }}>Theo kích cỡ</p>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="size-s"
                            checked={selectedSizes.includes('S')}
                            onChange={() => handleCheckboxChange('S', setSelectedSizes, selectedSizes)}
                        />
                        <label className="form-check-label" htmlFor="size-s">
                            S
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="size-xl"
                            checked={selectedSizes.includes('XL')}
                            onChange={() => handleCheckboxChange('XL', setSelectedSizes, selectedSizes)}
                        />
                        <label className="form-check-label" htmlFor="size-xl">
                            XL
                        </label>
                    </div>
                </div>
                <div>
                    <p style={{ marginBottom: 0 }}>Theo thương hiệu</p>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="brand-nike"
                            checked={selectedBrands.includes('Nike')}
                            onChange={() => handleCheckboxChange('Nike', setSelectedBrands, selectedBrands)}
                        />
                        <label className="form-check-label" htmlFor="brand-nike">
                            Nike
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="brand-nintendo"
                            checked={selectedBrands.includes('Nintendo')}
                            onChange={() => handleCheckboxChange('Nintendo', setSelectedBrands, selectedBrands)}
                        />
                        <label className="form-check-label" htmlFor="brand-nintendo">
                            Nintendo
                        </label>
                    </div>
                </div>
                <div>
                    <p style={{ marginBottom: 0 }}>Theo màu sắc</p>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="color-red"
                            checked={selectedColors.includes('Đỏ')}
                            onChange={() => handleCheckboxChange('Đỏ', setSelectedColors, selectedColors)}
                        />
                        <label className="form-check-label" htmlFor="color-red">
                            Đỏ
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="color-pink"
                            checked={selectedColors.includes('Hồng')}
                            onChange={() => handleCheckboxChange('Hồng', setSelectedColors, selectedColors)}
                        />
                        <label className="form-check-label" htmlFor="color-pink">
                            Hồng
                        </label>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Filter;