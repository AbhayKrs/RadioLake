import "../styles/volume_controller.css";

const VolumeInput = (props) => {
    const { volume, setVolume } = props;

    return (
        <input
            type="range"
            id="volume-slider"
            min="0"
            max="100"
            step="1"
            value={volume}
            style={{
                backgroundSize: volume + "% 100%"
            }}
            onChange={(ev) => {
                var val = ev.target.value;
                setVolume(val);
            }}
        />
    )
}

export default VolumeInput;