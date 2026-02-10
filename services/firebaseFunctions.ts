import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions, getFirebaseAuth } from "@/firebase";

export type CallableResponse<T> = {
  data: T;
};

const callFunction = async <T>(
  name: string,
  payload?: unknown
): Promise<CallableResponse<T>> => {
  const auth = getFirebaseAuth();

  if (auth?.currentUser) {
    await auth.currentUser.getIdToken(true);
  }

  const fn = httpsCallable(getFirebaseFunctions(), name);
  const res = payload ? await fn(payload) : await fn();

  return res.data as CallableResponse<T>;
};

export default callFunction;
