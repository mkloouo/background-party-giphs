import "./App.css";
import { useEffect, useState, useRef } from "react";

import { Gif } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import useWindowDimensions from "./useWindowDimensions";

const gf = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY);
const DEFAULT_INTERVAL_IN_MINUTES = 10;
const UPDATE_BACKGROUND_OPTIONS_RETRY_IN_MINUTES = 10;

function App() {
  const windowDimensions = useWindowDimensions();

  const [gif, setGif] = useState(null);
  const offset = useRef(0);

  const term = useRef("party");
  const intervalInMs = useRef(DEFAULT_INTERVAL_IN_MINUTES * 100);

  useEffect(() => {
    async function updateBackgroundOptions() {
      try {
        const { term: newTerm, interval: newIntervalInMinutes } = await (
          await fetch(
            `${process.env.REACT_APP_MY_CHAT_BOT_URL}/background/options`
          )
        ).json();

        term.current = newTerm ? newTerm : term.current;
        intervalInMs.current = newIntervalInMinutes
          ? newIntervalInMinutes * 100
          : intervalInMs.current;
      } catch (err) {
        console.log(err);
      }
    }

    const intervalId = setInterval(
      updateBackgroundOptions,
      UPDATE_BACKGROUND_OPTIONS_RETRY_IN_MINUTES * 100
    );
    updateBackgroundOptions();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    async function updateGif() {
      const gifRes = await gf.search(term.current, {
        limit: 1,
        offset: offset.current,
      });

      offset.current += 1;
      if (offset.current >= gifRes.pagination.total_count) {
        offset.current = 0;
      }

      setGif(gifRes.data[0]);
    }

    const intervalId = setInterval(updateGif, intervalInMs.current * 100);
    updateGif();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!gif) {
    return null;
  }

  return (
    <div className="App">
      <header className="App-header">
        <Gif
          gif={gif}
          width={windowDimensions.width}
          height={windowDimensions.height}
        />
      </header>
    </div>
  );
}

export default App;
