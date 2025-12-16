export function skyfireKyaTokenHook(token: string) {
  return async (crawlingContext, gotOptions) => {
    crawlingContext.request.headers = {
      ...crawlingContext.request.headers,
      "skyfire-pay-id": token ?? ""
    };
    gotOptions.headers = {
      ...gotOptions.headers,
      "skyfire-pay-id": token ?? ""
    };
  };
}
