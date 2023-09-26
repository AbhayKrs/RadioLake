import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import jwt_decode from 'jwt-decode';

// import ThemeToggle from "../components/ThemeToggle";
import { switchTheme } from "../store/reducers/common.reducers";

import { ReactComponent as HeaderLogo } from '../assets/icons/header-logo.svg';
import { PiUserCircleFill, PiCompassToolBold } from 'react-icons/pi';
import { RiHomeLine, RiLoginBoxLine, RiLogoutBoxLine } from 'react-icons/ri';
import { BiLogInCircle, BiLogOutCircle } from 'react-icons/bi';
import { HiOutlineTerminal } from 'react-icons/hi';
import { TbSettings, TbEditCircle } from 'react-icons/tb';

import { HANDLE_SIGNOUT } from '../store/reducers/user.reducers';
import { handle_user_signOut } from '../utils/api';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const common = useSelector(state => state.common);
    const user = useSelector(state => state.user);

    const [activeRoute, setActiveRoute] = useState('');

    useEffect(() => {
        setActiveRoute(location.pathname);
    }, [location.pathname])


    const handleColorChange = () => {
        const themeSwitch = common?.theme === 'light' ? 'dark' : 'light';
        dispatch(switchTheme(themeSwitch));
    };

    const handleSignout = () => {
        dispatch(HANDLE_SIGNOUT());
        handle_user_signOut();
    }

    return (
        <nav id="sidebar" className='fixed inset-y-2 left-2 flex flex-col rounded-lg py-4 w-14 bg-indigo-500 dark:bg-indigo-500 shadow-[3px_4px_3px_rgba(175,175,175,0.55),_3px_2px_2px_rgba(175,175,175,0.5)] dark:shadow-[3px_4px_3px_rgba(10,10,10,0.55),_3px_2px_2px_rgba(10,10,10,0.5)]'>
            <div className="flex flex-col space-y-6 items-center">
                <HeaderLogo fill={common?.theme === 'light' ? '#262626' : 'white'} className="h-12 w-auto" />
                <button onClick={() => navigate('/')} className="cursor-pointer">
                    <RiHomeLine className={`h-7 w-7 ${activeRoute === '/' ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-800 dark:text-neutral-200'}`} />
                </button>
                <button onClick={() => navigate('/templates')} className="cursor-pointer">
                    <PiCompassToolBold className={`h-7 w-7 ${activeRoute.includes('/templates') ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-800 dark:text-neutral-200'}`} />
                </button>
                <button onClick={() => navigate('/dashboard')} className="cursor-pointer">
                    <HiOutlineTerminal className={`h-7 w-7 ${activeRoute === '/dashboard' ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-800 dark:text-neutral-200'}`} />
                </button>
                {activeRoute.includes('/editor') && <button onClick={() => navigate('/editor')} className="cursor-pointer">
                    <TbEditCircle className='h-7 w-7 text-neutral-200 dark:text-neutral-800' />
                </button>}
            </div>
            <div className='flex flex-col space-y-4 items-center mt-auto'>
                {user?.isSignedIn ?
                    <>
                        <button onClick={() => navigate('/profile')} className="cursor-pointer">
                            <PiUserCircleFill className='h-8 w-8 text-neutral-200 dark:text-neutral-800' />
                        </button>
                        <button onClick={handleSignout} className="cursor-pointer">
                            <BiLogOutCircle className='h-7 w-7 text-neutral-200 dark:text-neutral-800' />
                        </button>
                    </>
                    :
                    <button onClick={() => navigate('/signin')} className="cursor-pointer">
                        <BiLogInCircle className={`h-7 w-7 ${activeRoute.includes('/signin') || activeRoute.includes('/signup') ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-800 dark:text-neutral-200'}`} />
                    </button>
                }
                <button onClick={() => navigate('/settings')} className="cursor-pointer">
                    <TbSettings className={`h-7 w-7 ${activeRoute.includes('/settings') ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-800 dark:text-neutral-200'}`} />
                </button>
                {/* <ThemeToggle toggle={handleColorChange} /> */}
            </div>
        </nav>
    )
}

export default Header;