import React from "react";
import { useMachine } from "@xstate/react";
import {
  MdPlayArrow,
  MdPause,
  MdStop,
  MdSkipNext,
  MdSkipPrevious,
  MdFastForward,
  MdFastRewind,
  MdEject
} from "react-icons/md";

import { cdPlayerMachine } from "./cd-player.machine";
import { CD } from "./SVG/CD";
import { CenterCD } from "./SVG/center";

export function CDPlayer() {
  const [state, send] = useMachine(cdPlayerMachine);

  function handlePlayPause() {
    if (state.matches("cd_loaded.anon.cd_stopped")) {
      send("PLAY");
    }
    if (state.matches("cd_loaded.anon.cd_paused")) {
      send("PLAY");
    }
    if (state.matches("cd_loaded.anon.cd_playing")) {
      send("PAUSE");
    }
  }

  return (
    <>
      <section className="cd-player-section">
        <div className="cd-player">
          {/* <Drawer state={state} onCDClick={cdClickHandler} /> */}
          <DigitalDisplay
            track={state.context.track}
            seconds={state.context.trackPlayed}
            state={state}
          />
          <Controls
            onPlayPause={handlePlayPause}
            onPrev={() => send("PREV_TRACK")}
            onRewindDown={() => send("REVERSE_DOWN")}
            onRewindUp={() => send("REVERSE_UP")}
            onStop={() => send("STOP")}
            onForwardDown={() => send("FORWARD_DOWN")}
            onForwardUp={() => send("FORWARD_UP")}
            onNext={() => send("NEXT_TRACK")}
            onEject={() => send({ type: "EJECT", cd: [10, 10, 10] })}
          />
        </div>
      </section>
      <DisplayStates stateValue={state.value} context={state.context} />
    </>
  );
}

function Controls({
  onPrev,
  onRewindDown,
  onRewindUp,
  onStop,
  onPlayPause,
  onForwardDown,
  onForwardUp,
  onNext,
  onEject
}) {
  return (
    <div className="cd-buttons">
      <MdSkipPrevious className="cd-button__label" />
      <MdFastRewind className="cd-button__label" />
      <MdStop className="cd-button__label" />
      <div className="cd-button__label">
        <MdPlayArrow />
        <MdPause />
      </div>
      <MdFastForward className="cd-button__label" />
      <MdSkipNext className="cd-button__label" />
      <MdEject className="cd-button__label" />
      <button className="cd-button" onClick={onPrev} title="skip previous" />
      <button
        className="cd-button"
        title="Rewind"
        onMouseDown={onRewindDown}
        onMouseUp={onRewindUp}
      />
      <button className="cd-button cd-button--stop" onClick={onStop} />
      <button
        className="cd-button play-pause"
        title="Play/Pause"
        onClick={onPlayPause}
      />

      <button
        className="cd-button"
        title="Fast forward"
        onMouseDown={onForwardDown}
        onMouseUp={onForwardUp}
      />
      <button className="cd-button" title="Skip next" onClick={onNext} />
      <button className="cd-button" title="Eject" onClick={onEject} />
    </div>
  );
}

function DigitalDisplay({ track, seconds, state }) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, 0);
  const ss = (seconds % 60).toString().padStart(2, 0);
  return (
    <div className="display">
      {state.matches("cd_loaded") && (
        <>
          <span>track</span>
          <span>time</span>
          <div className="display__track">
            <span className="digital-display__char--track">{track}</span>
          </div>
          <div
            style={{
              visibility: state.matches(
                "cd_loaded.anon.cd_paused.time_track_blank"
              )
                ? "hidden"
                : "visible"
            }}
          >
            <span className="digital-display__char">{mm[0]}</span>
            <span className="digital-display__char">{mm[1]}</span>:
            <span className="digital-display__char">{ss[0]}</span>
            <span className="digital-display__char">{ss[1]}</span>
          </div>
        </>
      )}
      {state.matches("no_cd_loaded.cd_drawer_closed") && (
        <span className="digital-display__char">NO DISC</span>
      )}
      {state.matches("no_cd_loaded.cd_drawer_open") && (
        <span className="digital-display__char">DRAW OPEN</span>
      )}
    </div>
  );
}

function Drawer({ state, onCDClick }) {
  const [cdClass, flapClass] = matches();

  return (
    <div className="cd-drawer">
      <div className={cdClass} onClick={onCDClick}>
        <CD />
      </div>
      <div className={flapClass} />
      {/* <div className={trayClass}>
        <Tray />
      </div> */}
      <div className="cd_drawer__label">Vertical loading</div>
      <div className="cd-drawer__center">
        <CenterCD />
      </div>
    </div>
  );

  function matches() {
    if (state.matches("no_cd_loaded.cd_drawer_closed"))
      return [
        "cd cd--no_disc",
        "bevel",
        "cd-drawer__tray cd-drawer__tray--no_disc"
      ];
    if (state.matches("no_cd_loaded"))
      return [
        "cd cd--disc_ready",
        "bevel bevel--open",
        "cd-drawer__tray cd-drawer__tray--disc_ready"
      ];
    if (state.matches("cd_loaded.anon.cd_playing"))
      return ["cd cd--playing", "bevel", "cd-drawer__tray"];
    return ["cd", "bevel", "cd-drawer__tray"];
  }
}

function DisplayStates({ stateValue, context }) {
  function x(stateValue) {
    if (typeof stateValue === "string") {
      return (
        <ul className="states__container">
          <li>{stateValue}</li>
        </ul>
      );
    }
    const states = Object.keys(stateValue);
    return (
      <ul className="states__container">
        {states.map((s, i) => (
          <li key={i}>
            {s}
            <ul>{x(stateValue[s])}</ul>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <section className="states">
      {x(stateValue)}
      <ul>
        <li>{context.track}</li>
        <li>{context.trackPlayed}</li>
        <li>cd</li>
        <ul>
          {context.cd.map((t, i) => {
            return <li key={i}>{t}</li>;
          })}
        </ul>
      </ul>
    </section>
  );
}
