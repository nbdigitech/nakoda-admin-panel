import callFunction from "./firebaseFunctions";

export const createUserByPhone = (payload) =>
  callFunction("createUserByPhone", payload);

export const checkUserBeforeLogin = (payload) =>
  callFunction("checkUserBeforeLogin", payload);

export const activateUserAfterOtp = (payload) =>
  callFunction("activateUserAfterOtp", payload);
