import './VideoPlayer.css'

export default function VideoPlayer({ youtubeId }) {
  return (
    <div className="player-wrapper">
      <iframe
        className="player-iframe"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
