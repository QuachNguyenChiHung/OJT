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
                    <p className="text-white">Bản quyền © 2025 FURIOUS FIVE</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;