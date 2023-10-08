import { useEffect, useState } from 'react';
import VolumeInput from './VolumeInput';

import { ReactComponent as StationAudioWaiting } from '../assets/icons/station-audio-waiting.svg';
import SiteLogo from '../assets/images/logo192.png';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { RiShareFill } from 'react-icons/ri';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { IoStop } from 'react-icons/io5';

const SidePanel = (props) => {
    const { playingStation, playerWaiting, viewedStations } = props;
    const [volume, setVolume] = useState(100);
    const [liked, setLiked] = useState(false);

    return (
        <div className="absolute z-30 bottom-2 left-2 z-40 max-w-[18em] w-full flex flex-col gap-2">
            <div className='flex flex-col bg-amber-300 rounded-md p-2'>
                {/* <img src={SiteLogo} className='h-14 w-14' /> */}
                <ul className='flex flex-col max-h-96 h-full overflow-y-auto divide-y'>
                    {viewedStations.map(itx => (
                        <li className='font-caviar font-bold text-sm p-1'>{itx.name}</li>
                    ))}
                </ul>
            </div>
            <div className='flex flex-col gap-2 bg-amber-300 p-2 rounded-md'>
                <div>
                    <p className='font-caviar tracking-tight text-xl font-black text-neutral-800'>{playingStation.data.name}</p>
                    <p className='font-caviar text-xs font-bold'>{playingStation.data.country}</p>
                </div>
                <div className='flex flex-row items-center gap-3'>
                    <div className='flex flex-row gap-2'>
                        {playerWaiting ?
                            <StationAudioWaiting fill="#000" stroke="#e11d48" className='w-8 h-8 text-neutral-800 cursor-pointer' />
                            :
                            <IoStop className='w-7 h-7 text-neutral-800 cursor-pointer' />
                        }
                        {liked ?
                            <GoHeart className='w-7 h-7 text-gray-800 cursor-pointer' />
                            :
                            <GoHeartFill className='w-7 h-7 text-rose-600 cursor-pointer' />
                        }
                        <RiShareFill className='w-7 h-7 text-neutral-800 cursor-pointer' />
                    </div>
                    <VolumeInput volume={volume} setVolume={setVolume} />
                </div>
            </div>
        </div>
    )
}

export default SidePanel;