/** @jsx jsx */
import React, { useState } from "react";

import { jsx, css } from "@emotion/core";

import { Button } from "@material-ui/core";
import { useLocalStorage } from "react-use";

const redirectUrl = `http://localhost:3333/o-auth-callback`;

const {
  REACT_APP_ALLEGRO_OAUTH_CLIENT_ID: allegroClientId,
  NODE_ENV
} = process.env;
const development = NODE_ENV === "development";
const allegroDomain = "https://allegro.pl";

function App() {
  const onSubmit = async e => {
    e.preventDefault();
    console.log("submit");
    try {
      const url = `${allegroDomain}/auth/oauth/authorize?response_type=code&client_id=${allegroClientId}&redirect_uri=${redirectUrl}`;
      window.location = url;
    } catch (e) {
      console.log({ e });
    }
  };

  return (
    <div
      className="App"
      css={css`
        height: 100%;
        background: #ddd;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <form
        noValidate
        autoComplete="off"
        css={css`
          background: white;
          display: flex;
          flex-flow: column nowrap;
          padding: 20px;
          text-align: center;
        `}
        onSubmit={onSubmit}
      >
        <h3>{"Allegro connector".toUpperCase()}</h3>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            margin-bottom: 25px;
          `}
        ></div>
        <Button variant="contained" type="submit">
          Zaloguj przez ALLEGRO
        </Button>
      </form>
    </div>
  );
}

export default App;
