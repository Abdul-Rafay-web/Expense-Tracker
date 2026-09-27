export default function Background() {
    return (
        <div className="backdrop" aria-hidden="true">
            <div className="backdrop__orb backdrop__orb--plum" />
            <div className="backdrop__orb backdrop__orb--teal" />
            <div className="backdrop__orb backdrop__orb--ember" />
            <div className="backdrop__grid" />
            <div className="backdrop__grain" />
            <div className="backdrop__vignette" />
        </div>
    );
}
