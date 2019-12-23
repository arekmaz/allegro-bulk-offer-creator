require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const chromeLauncher = require("chrome-launcher");
const cors = require("cors");
const axios = require("axios");

const app = express();
const {
  NODE_ENV,
  PORT,
  ALLEGRO_OAUTH_REDIRECT_PATH,
  ALLEGRO_OAUTH_CLIENT_ID,
  ALLEGRO_OAUTH_CLIENT_SECRET
} = process.env;
const development = NODE_ENV === "development";
const allegroDomain = development
  ? "https://allegro.pl.allegrosandbox.pl"
  : "https://allegro.pl";

let oauthToken;

const getAuthToken = code => {
  const getTokenAddress = `${allegroDomain}/auth/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${"http://localhost:3333"}${ALLEGRO_OAUTH_REDIRECT_PATH}`;
  const basicToken = base64encode(
    `${ALLEGRO_OAUTH_CLIENT_ID}:${ALLEGRO_OAUTH_CLIENT_SECRET}`
  );

  const headers = {
    Authorization: `Basic ${basicToken}`
  };
  return axios.post(getTokenAddress, {}, { headers });
};

const createDraftOffer = offerRow => {
  const [] = offerRow;
  return {
    name: ""
  };
};

app.use(bodyParser.json());
app.use(express.static("client/build"));

if (development) {
  app.use(cors());
}

app.get("/", (req, res) => {
  if (development) {
    res.redirect("http://localhost:3000");
  } else {
    res.send("ok");
  }
});

app.post("/login", (req, res) => {
  const {
    body,
    body: { login, password }
  } = req;
  res.send(JSON.stringify({ l: login, p: password }));
});

app.get(ALLEGRO_OAUTH_REDIRECT_PATH, (req, res) => {
  console.log("o auth callback", req);
  const {
    query,
    query: { code }
  } = req;
  oauthToken = code;
  console.log({ code, query });

  getAuthToken(code)
    .then(response => {
      console.log({ tokenResponse: response });
    })
    .catch(e => {
      console.log("error", e);
    })
    .finally(() => {
      const redirectUrl = development
        ? "http://localhost:3000/success"
        : "/success";
      res.redirect(redirectUrl);
    });
});

app.post("/offer", (req, res) => {
  if (!oauthToken) {
    return res.send(
      500,
      JSON.stringify({
        status: "error",
        message: "Użytkownik nie jest zalogowany"
      })
    );
  }
  const {
    body: { content }
  } = req;
  console.log({ content });
  const [head, ...rows] = content
    .split(/\r?\n/)
    .map(rawRow => rawRow.split(/[;,]/));

  res.send(
    200,
    JSON.stringify({
      parsed: rows
    })
  );
});

app.get("/test", (req, res) => {
  res.send("test");
});

const server = app.listen(PORT || 0, () => {
  const address = server.address();
  const serverPort = address.port;
  const startingUrl = `http://localhost:${serverPort}`;
  if (development) {
    return;
  }
  chromeLauncher
    .launch({
      startingUrl,
      chromeFlags: []
    })
    .then(chrome => {
      console.log(`Chrome opened on port ${chrome.port}`);
    });
  console.log(`Server listening on port ${serverPort}`);
});

function base64encode(str) {
  return Buffer.from(str).toString("base64");
}
