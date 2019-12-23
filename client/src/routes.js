import React from "react";
import App from "./App";
import CreateOfferPage from "./CreateOfferPage";

import { Route, Switch, Redirect } from "react-router-dom";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/success" component={CreateOfferPage} />
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  );
}
