import React from 'react';

const logoImg = '/img/logo.png';
const facebookImg = '/img/facebook.png';
const twitterImg = '/img/twitter.png';
const instagramImg = '/img/instagram.png';

const Footer = () => {
    return (
        <footer style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div>
                <div className="container" style={{ maxWidth: '1200px !important' }}>
                    <div className="d-block d-md-flex justify-content-md-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                            <img className="logo" src={logoImg} alt="Logo" />
                        </div>
                        <div>
                            <div className="d-flex align-items-center">
                                <h4 className="text-white" style={{ marginBottom: '0px' }}>
                                    KẾT NỐI VỚI CHÚNG TÔI !
                                </h4>
                                <div className="d-flex">
                                    <div className="mx-2">
                                        <a href="#">
                                            <img className="magifier" src={facebookImg} alt="Facebook" />
                                        </a>
                                    </div>
                                    <div className="mx-2">
                                        <a href="#">
                                            <img className="magifier" src={twitterImg} alt="Twitter" />
                                        </a>
                                    </div>
                                    <div className="mx-2">
                                        <a href="#">
                                            <img className="magifier" src={instagramImg} alt="Instagram" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container" style={{ maxWidth: '1200px !important' }}>
                    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">
                        {[...Array(7)].map((_, index) => (
                            <div className="col" key={index}>
                                <div>
                                    <p className="text-white" style={{ marginBottom: '-1px' }}>
                                        Quần áo
                                    </p>
                                    <ul className="foot-list">
                                        <li>{index === 1 ? 'Về chúng tôi' : 'Item 1'}</li>
                                        <li>Item 2</li>
                                        <li>Item 3</li>
                                        <li>Item 4</li>
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-white">Bản quyền © 2025 FURIOUS FIVE</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;