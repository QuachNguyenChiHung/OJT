import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const logoImg = '/img/logo.png';
const magnifierImg = '/img/magnifier.png';
const searchImg = '/img/search.png';
const userImg = '/img/user.png';
const shoppingCartImg = '/img/shopping-cart.png';

const Navbar = () => {
    const navigate = useNavigate();
    const menuItems = Array(7).fill('QUẦN ÁO');
    const [loggedIn, setLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
            if (res?.data) {
                setCurrentUser(res.data);
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
        } catch (error) {
            // not logged in or network error — keep user as not logged in
            setLoggedIn(false);
        }
    }

    const logout = async () => {
        try {
            await axios.post(import.meta.env.VITE_API_URL + '/auth/logout', {}, { withCredentials: true });
        } catch (e) {
            // ignore errors — still clear client state
        }
        setLoggedIn(false);
        setCurrentUser({ email: '', fullName: '', role: '', phoneNumber: '', address: '' });
        navigate('/login');
    }
    useEffect(() => {
        fetchCurrentUser();
    }, []);
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { navigate('/search?q=' + encodeURIComponent(searchQuery)); return; } }}
                                    style={{
                                        borderWidth: '2px',
                                        borderColor: 'rgb(228, 148, 0)',
                                        borderRightWidth: '0px'
                                    }}
                                />
                                <button
                                    onClick={() => { navigate("/search?q=" + encodeURIComponent(searchQuery)); return; }}
                                    className="btn"
                                    type="button"
                                    style={{
                                        background: 'rgb(228, 148, 0)',
                                        padding: '0px 14px',
                                        borderWidth: '2px',
                                        borderColor: 'rgb(228, 148, 0)'
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
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/search?q=' + encodeURIComponent(searchQuery)); }}
                                            style={{
                                                borderWidth: '2px',
                                                borderColor: 'rgb(228, 148, 0)',
                                                borderRightWidth: '0px'
                                            }}
                                        />
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => navigate("/search?q=" + encodeURIComponent(searchQuery))}
                                            style={{
                                                background: 'rgb(228, 148, 0)',
                                                padding: '0px 14px',
                                                borderWidth: '2px',
                                                borderColor: 'rgb(228, 148, 0)'
                                            }}
                                        >
                                            <img className="magifier" src={magnifierImg} alt="Search" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {
                            loggedIn ? (
                                <>
                                    <div className="mx-1">
                                        <div className="dropdown">
                                            <button
                                                className="btn dropdown-toggle cancel-bg-change d-flex align-items-center"
                                                aria-expanded="false"
                                                data-bs-toggle="dropdown"
                                                type="button"
                                                style={{ paddingRight: '6px', paddingLeft: '6px' }}
                                            >
                                                <img
                                                    className="icon rounded-circle"
                                                    src={currentUser.avatarUrl || userImg}
                                                    alt="User"
                                                    style={{ width: '34px', height: '34px', objectFit: 'cover' }}
                                                />

                                            </button>
                                            <div className="dropdown-menu">
                                                <button
                                                    className="dropdown-item"
                                                    type="button"
                                                    onClick={() => navigate('/profile')}
                                                >
                                                    Thông Tin Cá Nhân
                                                </button>
                                                <button
                                                    className="dropdown-item"
                                                    type="button"
                                                    onClick={() => navigate('/orders')}
                                                >
                                                    Đơn Hàng Của Tôi
                                                </button>
                                                <button className="dropdown-item" type="button" onClick={logout}>
                                                    Đăng Xuất
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mx-1">
                                        <button
                                            className="btn p-0 border-0 bg-transparent"
                                            onClick={() => navigate('/cart')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img
                                                className="icon shopping"
                                                src={shoppingCartImg}
                                                alt="Shopping Cart"
                                            />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mx-1">
                                        <Button variant="orange" className='btn-orange' style={{
                                            borderColor: 'rgb(228, 148, 0)'
                                        }} onClick={() => {navigate('/login');}}>
                                            Đăng Nhập
                                        </Button>
                                        <Button variant="orange" className='btn-orange mx-3' style={{
                                            borderColor: 'rgb(228, 148, 0)'
                                        }} onClick={() => navigate('/register')}>
                                            Đăng Kí
                                        </Button>
                                    </div>
                                </>
                            )
                        }

                    </div>
                </div>
            </header>
            <nav>
                <div className="container-fluid" style={{ background: 'rgb(228, 148, 0)' }}>
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
                                style={{ backgroundColor: 'rgb(228, 148, 0)', padding: 0 }}
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
                                                            background: 'rgb(228, 148, 0)'
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