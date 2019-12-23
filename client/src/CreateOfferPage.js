/** @jsx jsx */
import React, { useRef } from "react";
import { css, jsx } from "@emotion/core";
import { useAsyncFn } from "react-use";

import { Input, Button } from "@material-ui/core";
import { post } from "./api/request";

import { AgGridReact as Grid } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import "ag-grid-community/dist/styles/ag-grid.css";

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
    return post("/offer", {
      content: state.value
    });
  });
  console.log({ state, sendState });
  if (state.value) {
    const colDefs = state.value
      ? state.value[0].map((headerName, index) => ({
          field: String(index),
          headerName,
          editable: true,
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
      <>
        <Button onClick={send}>Stwórz aukcje</Button>
        <div
          css={css`
            height: 100%;
            width: 100%;
          `}
        >
          <Grid columnDefs={colDefs} rowData={rowData} sty />
        </div>
      </>
    );
  }
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
      <Button onClick={submit}>Stwórz akcję</Button>
    </div>
  );
}
