import React, { useRef, useState, useEffect } from 'react';

import { FaGreaterThan, FaHashtag } from 'react-icons/fa6';
import { MdSearch, MdClose } from 'react-icons/md';
import { FiAtSign } from 'react-icons/fi';

const SearchBar = (props) => {
    const { searchVal, setSearchVal } = props;

    const handleSearch = (val) => {
        setSearchVal(val);
    }

    return (
        <div className="flex flex-row items-center w-full mt-1 p-1 bg-neutral-800 rounded-xl">
            <div className="flex relative items-center justify-center text-neutral-800 dark:text-gray-300 pl-2 pr-1">
                <MdSearch className='h-6 w-6 text-gray-300' />
            </div>
            <input
                type="text"
                name="search"
                value={searchVal}
                placeholder="Search..."
                autoComplete="off"
                className="w-full font-caviar font-semibold tracking-wide bg-transparent text-gray-300 placeholder-gray-300 focus:outline-none"
                onChange={(ev) => handleSearch(ev.target.value)}
            />
            {searchVal.length === 0 ?
                '' :
                <button className="flex items-center justify-center text-gray-300 h-full w-12" onClick={() => setSearchVal('')}>
                    <MdClose className='h-5 w-5' />
                </button>
            }
        </div >
    )
}


export default SearchBar;