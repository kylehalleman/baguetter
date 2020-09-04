// Action types
const LOAD = "app/baguette/LOAD";

// Reducer
const initialState = "";

export default function reducer(state = initialState, { type, payload } = {}) {
	switch (type) {
		default:
			return state;
	}
}

// Action creators
function loadBaguette() {
	return { type: LOAD };
}

// Async action creators
export function fetchBaguette() {
	return (dispatch) => {
		dispatch(loadBaguette());
	};
}

// Selectors
const getBaguette = (state) => state.baguette;
