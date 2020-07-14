import React from "react";

import { storiesOf } from "@storybook/react";

import ComponentName from "./ComponentName";

storiesOf("ComponentName", module).add("basic", () => {
  return <ComponentName />;
});
