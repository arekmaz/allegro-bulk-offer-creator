/** @jsx jsx */
import React, { useRef } from "react";
import { css, jsx } from "@emotion/core";
import { useAsyncFn } from "react-use";

import { Input, Button } from "@material-ui/core";

import { AgGridReact as Grid } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import createOffers from "./api/offer/createOffers";

export default function CreateOfferPage(props) {
  const fileInputRef = useRef();
  const [state, trigger] = useAsyncFn(async () => {
    const files = Array.from(fileInputRef.current.files);
    console.log({ files });
    if (!files.length) {
      throw Error("Brak wczytanego pliku");
    }
    const decoder = new TextDecoder("utf-8");
    return Promise.all(
      files.map(file =>
        file
          .stream()
          .getReader()
          .read()
      )
    ).then(results => {
      return results
        .map(({ value }) => decoder.decode(value))
        .join("")
        .split(/\r?\n/)
        .map(rawRow => rawRow.split(/[,;]/));
    });
  });
  const submit = e => {
    e.preventDefault();
    trigger();
  };
  const [sendState, send] = useAsyncFn(async () => {
    const { value: offers } = state;
    console.log({ state, offers });
    const offersResponse = await createOffers(offers);
  }, [state]);
  console.log({ state, sendState });
  if (!state.value) {
    return (
      <div
        css={css`
          height: 100%;
          display: flex;
          padding: 10px;
          justify-content: center;
          align-items: center;
        `}
      >
        {state.loading ? (
          <span>Loading</span>
        ) : state.error ? (
          <span>{`Error: ${state.error.message}`}</span>
        ) : null}
        <Input type="file" inputRef={fileInputRef} />
        <Button color="primary" variant="contained" onClick={submit}>
          Załaduj plik
        </Button>
      </div>
    );
  }
  const colDefs = state.value
    ? state.value[0].map((headerName, index) => ({
        field: String(index),
        headerName,
        // editable: true,
        draggable: true
      }))
    : null;
  const rowData = state.value
    ? state.value.slice(1).map(row =>
        row.reduce((acc, value, index) => {
          return {
            ...acc,
            [String(index)]: value
          };
        }, {})
      )
    : null;
  console.log({ colDefs, rowData });
  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        align-items: flex-start;
        flex-flow: column;
      `}
    >
      <Button onClick={send} color="primary" variant="contained">
        Stwórz aukcje
      </Button>
      <div
        css={css`
          ${"" /* height: 100%; */}
          flex: 1;
          width: 100%;
        `}
      >
        <Grid columnDefs={colDefs} rowData={rowData} />
      </div>
    </div>
  );
}
