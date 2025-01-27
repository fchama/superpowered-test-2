import { useState } from "react";
import { useSuper } from "../hook/use-super-v5";
import { useDebounce } from "react-use";

const formatTime = (positionMs, durationMs) => {
  if (!positionMs || !durationMs) {
    return "0:00 / 0:00";
  }

  const position = Math.floor(positionMs / 1000);
  const duration = Math.floor(durationMs / 1000);
  const minutes = Math.floor(position / 60);
  const seconds = position - minutes * 60;
  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = duration - durationMinutes * 60;
  return `${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds} / ${durationMinutes}:${
    durationSeconds < 10 ? "0" : ""
  }${durationSeconds}`;
};

export default function ModuleTest() {
  const [url, setUrl] = useState(
    "https://d2.moises.ai/v3/download/moises-production--tasks/operations/SEPARATE_CUSTOM/02d32013-8b74-49f3-ae4c-da8334fcf106/other.m4a"
    // "https://d2.moises.ai/v3/download/moises-production--tasks/operations/SEPARATE_CUSTOM/66b456ad-d746-40d8-a77a-ce60d5e67de3/other.m4a"
    // "https://d2.moises.ai/v3/download/moises-production--tasks/operations/SEPARATE_B/377929eb-d6a6-4001-8fcf-30d80be2a342/vocals.m4a" // silent
  );

  const { data, buffers, onParamChange, loadTrack, loadBuffer, play, pause } =
    useSuper({
      url,
    });

  const [seekTo, setSeekTo] = useState(0);
  useDebounce(
    () => {
      onParamChange("localPlayerSeek", seekTo);
    },
    500,
    [seekTo]
  );

  return (
    <div className="bg-blue-500">
      <h1>Teste</h1>
      <br />
      <br />
      <div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <br />
        <button id="loadAssetButton" onClick={loadTrack}>
          Load and play local track
        </button>
        <br />
        <br />
        <p>Progress: {formatTime(data?.positionMs, data?.durationMs)}</p>
        <input
          type="range"
          step="1"
          min="0"
          max={data?.durationMs}
          value={data?.positionMs || 0}
          onInput={(e) => setSeekTo(e.currentTarget.value)}
        />
        <br />
        <br />
        <button id="loadAssetButton" onClick={play}>
          Play
        </button>
        <button id="loadAssetButton" onClick={pause}>
          Pause
        </button>
        <br />
        <br />
        <div id="bootedControls">
          <span>Player volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="1"
            onInput={(e) =>
              onParamChange("localPlayerVolume", e.currentTarget.value)
            }
          />
          <span>Playback rate</span>
          <input
            type="range"
            min="0.003"
            max="2"
            step="0.001"
            // defaultValue="1"
            onInput={(e) =>
              onParamChange("localPlayerRate", e.currentTarget.value)
            }
          />
        </div>
        <span>Playback pitch</span>
        <input
          type="range"
          min="-1200"
          max="1200"
          step="1"
          // defaultValue="0"
          onInput={(e) =>
            onParamChange("localPlayerPitch", e.currentTarget.value)
          }
        />
      </div>
      <br />
      <br />
      {buffers.map((buffer, index) => (
        <button onClick={() => loadBuffer(buffer)} key={index}>
          Load Buffer {index + 1}
        </button>
      ))}
    </div>
  );
}
