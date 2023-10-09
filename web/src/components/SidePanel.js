import { useEffect, useState } from 'react';
import moment from 'moment';

import VolumeInput from './VolumeInput';
import SearchBar from './SearchBar';
import { country_codes } from '../utils/country-bounding-data';

import { ReactComponent as StationAudioWaiting } from '../assets/icons/station-audio-waiting.svg';
import { RiShareFill } from 'react-icons/ri';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { IoPlay, IoStop } from 'react-icons/io5';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';

const SidePanel = (props) => {
    const { audioRef, stations, selectedCountry, playingStation, setPlayingStation, playerWaiting, playerPause, setPlayerPause, viewedStations, setViewedStations, sidePanelUpdate, panelListView, setSidePanelUpdate } = props;
    const [searchVal, setSearchVal] = useState('');
    const [volume, setVolume] = useState(50);
    const [liked, setLiked] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(moment().format('LTS'));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(moment().format('LTS'));
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (selectedCountry.length > 0) {
            setIsOpen(false);
        }
    }, [selectedCountry])

    useEffect(() => {
        if (searchVal.length > 0) {
            const filteredList = stations.filter(item => item.countrycode === selectedCountry);
            const searchList = filteredList.filter(item => { return item.name.toLowerCase().includes(searchVal) });
            setViewedStations(searchList);
        } else {
            const filteredList = stations.filter(item => item.countrycode === selectedCountry);
            setViewedStations(filteredList);
        }
    }, [searchVal])


    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume, playingStation])

    const handleStationChange = (station) => {
        setPlayingStation({
            active: true,
            data: station
        });
        setSidePanelUpdate(true);
    }

    return (
        <div className="absolute z-30 bottom-1 left-1 z-40 max-w-xs w-full flex flex-col gap-2">
            {selectedCountry.length > 0 && <div className="flex flex-col items-center bg-amber-300 rounded-md">
                <div className={`flex flex-col items-center mb-2 px-2 w-full transition-colors duration-200 ${isOpen ? 'rounded-t-md' : 'rounded-md'}`}>
                    <div className='cursor-pointer' onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <HiChevronDown className='h-8 w-8 text-neutral-800' /> : <HiChevronUp className='h-8 w-8 text-neutral-800' />}
                    </div>
                    <div className='flex flex-row justify-between items-end w-full'>
                        <div className='flex flex-col'>
                            <p className="font-caviar text-2xl font-bold text-neutral-800">{country_codes.find(itx => itx.code === selectedCountry).name}</p>
                            <p className="font-caviar text-sm font-bold text-neutral-800">{viewedStations.length} Stations</p>
                        </div>
                        <p className='font-caviar text-xs font-bold text-neutral-800'>{currentTime}</p>
                    </div>
                    <SearchBar searchVal={searchVal} setSearchVal={setSearchVal} />
                </div>
                {isOpen && (
                    <>
                        <hr className='border-2 w-10/12 mx-4 rounded-md border-neutral-800' />
                        <ul style={{ maxHeight: "calc(100vh - 350px)" }} className='scrollbar flex flex-col w-full h-full mt-2 px-2 overflow-y-auto divide-y divide-neutral-800'>
                            {viewedStations.map(itx => (
                                <li key={itx.id} onClick={() => handleStationChange(itx)} className=''>
                                    <p className={`font-caviar font-bold text-sm w-full p-1.5 ${playingStation.data.stationuuid === itx.id ? 'bg-rose-600' : 'hover:bg-yellow-500/75'} cursor-pointer`}>{itx.name}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>}
            {/* <img src={SiteLogo} className='h-14 w-14' /> */}
            {playingStation.active && <div className='flex flex-col gap-2 bg-amber-300 p-2 rounded-md'>
                <div>
                    <p className='font-caviar tracking-tight text-xl font-black text-neutral-800'>{playingStation.data.name}</p>
                    <p className='font-caviar text-xs font-bold'>{playingStation.data.country}</p>
                </div>
                <div className='flex flex-row items-center gap-3'>
                    <div className='flex flex-row gap-2'>
                        {playerWaiting ?
                            <StationAudioWaiting fill="#000" stroke="#e11d48" className='w-8 h-8 text-neutral-800 cursor-pointer' />
                            :
                            playerPause ?
                                <IoPlay onClick={() => setPlayerPause(false)} className='w-7 h-7 text-neutral-800 cursor-pointer' />
                                :
                                <IoStop onClick={() => setPlayerPause(true)} className='w-7 h-7 text-neutral-800 cursor-pointer' />

                        }
                        {liked ?
                            <GoHeart className='w-7 h-7 text-gray-800 cursor-pointer' />
                            :
                            <GoHeartFill className='w-7 h-7 text-rose-600 cursor-pointer' />
                        }
                        <RiShareFill className='w-7 h-7 text-neutral-800 cursor-pointer' />
                    </div>
                    {!playerWaiting && audioRef.current && <VolumeInput volume={volume} setVolume={setVolume} />}
                </div>
            </div>}
        </div >
    )
}

export default SidePanel;