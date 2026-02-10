import callFunction from "./firebaseFunctions";

export const getDesignation = () => callFunction("getDesignation");
export const getCity = () => callFunction("getCity");
export const getState = () => callFunction("getState");
export const getDistrict = () => callFunction("getDistrict");
export const getTour = () => callFunction("getTour");
export const getSurvey = (payload) => callFunction("getSurvey", payload);
