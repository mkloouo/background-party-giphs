import "./App.css";
import { useEffect, useState, useRef } from "react";

import { Gif } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import config from "./config.json";

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch(config.giphy.apiKey);

function App() {
  const [gif, setGif] = useState(null);
  const offset = useRef(0);

  useEffect(() => {
    async function updateGif() {
      // configure your fetch: fetch 10 gifs at a time as the user scrolls (offset is handled by the grid)
      const res = await gf.search("party", {
        limit: 1,
        offset: offset.current,
      });

      offset.current += 1;

      if (offset.current >= res.pagination.total_count) {
        offset.current = 0;
      }

      if (res.data.length === 0) {
        setGif(null);
      }

      setGif(res.data[0]);
    }

    const intervalId = setInterval(updateGif, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  console.log(gif);

  if (!gif) {
    return null;
  }

  return (
    <div className="App">
      <header className="App-header">
        <Gif gif={gif} width={1920} />
      </header>
    </div>
  );
}

export default App;
