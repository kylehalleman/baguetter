import React from "react";
import { render } from "react-dom";
import Baguette from "./Baguette";

describe("Baguette", () => {
	it("renders without crashing", () => {
		render(<Baguette />, document.createElement("div"));
	});
});
