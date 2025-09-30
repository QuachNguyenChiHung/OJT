import React from 'react';
import logoImg from '../assets/img/logo.png';
import magnifierImg from '../assets/img/magnifier.png';
import searchImg from '../assets/img/search.png';
import userImg from '../assets/img/user.png';
import shoppingCartImg from '../assets/img/shopping-cart.png';

const Navbar = () => {
    const menuItems = Array(7).fill('QUẦN ÁO');

    return (
        <>
            <header className="d-flex justify-content-center align-items-center container-fluid">
                <div
                    className="d-flex justify-content-between align-items-center"
                    style={{
                        margin: 0,
                        marginTop: '8px',
                        maxWidth: '1200px',
                        width: '100%'
                    }}
                >
                    <div className="d-flex align-items-center">
                        <img className="logo" src={logoImg} alt="Logo" />
                    </div>
                    <div className="d-md-flex align-items-center">
                        <div className="d-none d-md-block">
                            <div className="input-group">
                                <input
                                    className="form-control search-control"
                                    type="text"
                                    placeholder="Tìm kiếm từ khóa"
                                    style={{
                                        borderWidth: '2px',
                                        borderColor: 'orange',
                                        borderRightWidth: '0px'
                                    }}
                                />
                                <button
                                    className="btn"
                                    type="button"
                                    style={{
                                        background: 'orange',
                                        padding: '0px 14px',
                                        borderWidth: '2px',
                                        borderColor: 'orange'
                                    }}
                                >
                                    <img className="magifier" src={magnifierImg} alt="Search" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="d-block d-md-none mx-1">
                            <div className="dropdown">
                                <button
                                    className="btn dropdown-toggle cancel-bg-change"
                                    aria-expanded="false"
                                    data-bs-toggle="dropdown"
                                    type="button"
                                    style={{ paddingRight: '6px', paddingLeft: '6px' }}
                                >
                                    <span>
                                        <img className="icon" src={searchImg} alt="Search" />
                                    </span>
                                </button>
                                <div
                                    className="dropdown-menu"
                                    style={{
                                        width: '90vw',
                                        paddingRight: '8px',
                                        paddingLeft: '8px'
                                    }}
                                >
                                    <div className="input-group" style={{ marginLeft: 'initial' }}>
                                        <input
                                            className="form-control search-control"
                                            type="text"
                                            placeholder="Tìm kiếm từ khóa"
                                            style={{
                                                borderWidth: '2px',
                                                borderColor: 'orange',
                                                borderRightWidth: '0px'
                                            }}
                                        />
                                        <button
                                            className="btn"
                                            type="button"
                                            style={{
                                                background: 'orange',
                                                padding: '0px 14px',
                                                borderWidth: '2px',
                                                borderColor: 'orange'
                                            }}
                                        >
                                            <img className="magifier" src={magnifierImg} alt="Search" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mx-1">
                            <div className="dropdown">
                                <button
                                    className="btn dropdown-toggle cancel-bg-change"
                                    aria-expanded="false"
                                    data-bs-toggle="dropdown"
                                    type="button"
                                    style={{ paddingRight: '6px', paddingLeft: '6px' }}
                                >
                                    <span>
                                        <img className="icon" src={userImg} alt="User" />
                                    </span>
                                </button>
                                <div className="dropdown-menu">
                                    <a className="dropdown-item" href="#">
                                        Đăng Nhập
                                    </a>
                                    <a className="dropdown-item" href="#">
                                        Đăng Kí
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mx-1">
                            <a className="d-block" href="#">
                                <img
                                    className="icon shopping"
                                    src={shoppingCartImg}
                                    alt="Shopping Cart"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            <nav>
                <div className="container-fluid" style={{ background: 'orange' }}>
                    <div>
                        <div
                            className="container"
                            style={{
                                maxWidth: '1200px',
                                width: '100%',
                                paddingRight: '0px',
                                paddingLeft: '0px'
                            }}
                        >
                            <nav
                                className="navbar navbar-expand-md mt-2 navbar-dark"
                                style={{ backgroundColor: 'orange', padding: 0 }}
                            >
                                <div className="container-fluid navbar-light p-0">
                                    <button
                                        data-bs-toggle="collapse"
                                        className="navbar-toggler"
                                        data-bs-target="#navcol-2"
                                        style={{
                                            height: '3rem',
                                            border: 'none',
                                            padding: 0,
                                            paddingRight: 0
                                        }}
                                    >
                                        <span
                                            className="navbar-toggler-icon"
                                            style={{ width: '37px' }}
                                        ></span>
                                    </button>
                                    <div
                                        className="collapse navbar-collapse"
                                        id="navcol-2"
                                        style={{ height: '3rem' }}
                                    >
                                        <ul className="navbar-nav">
                                            {menuItems.map((item, index) => (
                                                <li key={index} className="nav-item dropdown">
                                                    <a
                                                        className="dropdown-toggle nav-link"
                                                        aria-expanded="false"
                                                        data-bs-toggle="dropdown"
                                                        href="#"
                                                        style={{ color: 'rgb(255,255,255)' }}
                                                    >
                                                        {item}
                                                    </a>
                                                    <div
                                                        className="dropdown-menu"
                                                        style={{
                                                            borderStyle: 'none',
                                                            background: 'orange'
                                                        }}
                                                    >
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            style={{ color: 'rgb(255,255,255)' }}
                                                        >
                                                            Second Item
                                                        </a>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            style={{ color: 'rgb(255,255,255)' }}
                                                        >
                                                            Third Item
                                                        </a>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;