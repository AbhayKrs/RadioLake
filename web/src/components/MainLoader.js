import { ReactComponent as StationFinder } from '../assets/icons/station-finder.svg';

const MainLoader = (props) => {
    return (
        <div className='absolute z-50 flex flex-col gap-2 w-full h-screen items-center justify-center bg-neutral-800'>
            <StationFinder height={62} width={62} stroke="#fcd34d" />
            <h1 className='font-caviar text-xl tracking-wide font-bold text-amber-300'>Mapping Stations...</h1>
        </div>
    )
}

export default MainLoader;