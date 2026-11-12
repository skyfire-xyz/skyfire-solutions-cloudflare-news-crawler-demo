export function skyfireKyaTokenHook(token: string) {
  return async (crawlingContext, gotOptions) => {
    crawlingContext.request.headers = {
      ...crawlingContext.request.headers,
      "kyapay-token": token ?? "",
    };
    gotOptions.headers = {
      ...gotOptions.headers,
      "kyapay-token": token ?? "",
    };
  };
}
