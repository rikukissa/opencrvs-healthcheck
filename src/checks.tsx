export async function login() {
  const data = await fetch("http://localhost:4040/authenticate", {
    body: '{"username":"kennedy.mweene","password":"test"}',
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "omit",
  }).then((res) => res.json());

  if (data.token) {
    return data;
  }

  if (data.statusCode === 401) {
    throw new Error(data.error);
  }
  return fetch("http://localhost:4040/verifyCode", {
    body: `{"code":"000000","nonce":"${data.nonce}"}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}
