import { useEffect, useState } from "react";

import "./App.css";
import {
  Content,
  Frame,
  getTheme,
  Spinner,
  Box,
  Text,
} from "@riku/opencrvs-components";
import {
  StatusGreen,
  StatusWaitingValidation,
} from "@riku/opencrvs-components/lib/icons";
import { Icon } from "@riku/opencrvs-components/lib/Icon";
import { ThemeProvider } from "styled-components";

type Status = "LOADING" | "OK" | "FAIL";
type Service = {
  name: string;
  url: string;
  status: Status;
  type?: "dependency" | "service";
  acceptedStatusCodes?: number[];
};

async function getCountryConfig(): Promise<{ COUNTRY: string }> {
  const res = await fetch(
    new URL("/client-config.js", "http://localhost:3040").href
  );
  if (!res.ok) {
    throw new Error(`Could not fetch config, ${res.statusText} ${res.status}`);
  }
  return Function(
    `let window={}; ${await res.text()} ; return window.config`
  )();
}

async function login() {
  const data = await fetch("http://localhost:4040/authenticate", {
    body: '{"username":"kennedy.mweene","password":"test"}',
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "omit",
  }).then((res) => res.json());

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

const loginPromise = login();

function Check<T = any>({
  check,
  ok,
  fail,
  instructions,
}: {
  check: () => Promise<T>;
  ok: (result: T) => React.ReactNode;
  fail: (result: Error) => React.ReactNode;
  instructions?: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("LOADING");
  const [result, setResult] = useState<T | null>(null);
  useEffect(() => {
    check()
      .then((result) => {
        setResult(result as T);
        setStatus("OK");
      })
      .catch((err) => {
        setResult(err);
        setStatus("FAIL");
      });
  }, []);

  if (status === "LOADING") {
    return <Spinner id="spin" />;
  }
  return (
    <div className="check">
      {status === "OK" ? (
        <Icon name="CheckCircle" color="green" />
      ) : (
        <Icon name="AlertCircle" color="red" />
      )}
      <div>
        {status === "OK" ? ok(result as T) : fail(result as Error)}
        {status === "FAIL" && instructions && (
          <div className="instructions">{instructions}</div>
        )}
      </div>
    </div>
  );
}

async function getHearthLocations() {
  const { token } = await loginPromise;
  return await fetch("http://localhost:5001/fhir/Location", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
}

function App() {
  const [services, setServices] = useState<{
    [name: string]: Service;
  }>({
    auth: {
      name: "auth",
      url: "http://localhost:4040/ping",
      status: "LOADING",
      type: "service",
    },
    user: {
      name: "user",
      url: "http://localhost:3030/ping",
      status: "LOADING",
      type: "service",
    },
    webhooks: {
      name: "webhooks",
      url: "http://localhost:2525/ping",
      status: "LOADING",
      type: "service",
    },
    notification: {
      name: "notification",
      url: "http://localhost:2020/ping",
      status: "LOADING",
      type: "service",
    },
    gateway: {
      name: "gateway",
      url: "http://localhost:7070/ping?service=gateway",
      status: "LOADING",
      type: "service",
    },
    workflow: {
      name: "workflow",
      url: "http://localhost:5050/ping",
      status: "LOADING",
      type: "service",
    },
    search: {
      name: "search",
      url: "http://localhost:9090/ping",
      status: "LOADING",
      type: "service",
    },
    countryconfig: {
      name: "countryconfig",
      url: "http://localhost:3040/ping",
      status: "LOADING",
      type: "dependency",
    },
    metrics: {
      name: "metrics",
      url: "http://localhost:1050/ping",
      status: "LOADING",
      type: "service",
    },
    client: {
      name: "client",
      url: "http://localhost:3000/ping",
      status: "LOADING",
      type: "service",
    },
    login: {
      name: "login",
      url: "http://localhost:3020/ping",
      status: "LOADING",
      type: "service",
    },
    config: {
      name: "config",
      url: "http://localhost:2021/ping",
      status: "LOADING",
      type: "service",
    },
    openhim: {
      name: "openhim",
      acceptedStatusCodes: [200, 404],
      url: "http://localhost:5001/ping",
      status: "LOADING",
      type: "dependency",
    },
  });

  useEffect(() => {
    function setHealthy(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: { ...service, status: "OK" },
      }));
    }
    function setFailing(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: { ...service, status: "FAIL" },
      }));
    }

    Object.values(services).forEach((service) => {
      fetch(service.url)
        .then((res) => {
          if (
            (service.acceptedStatusCodes &&
              service.acceptedStatusCodes.includes(res.status)) ||
            res.status === 200
          ) {
            return setHealthy(service);
          }

          setFailing(service);
        })
        .catch((err) => {
          setFailing(service);
        });
    });
  }, []);

  return (
    <ThemeProvider theme={getTheme()}>
      <div className="App">
        <Frame header={null} skipToContentText={""}>
          <Frame.Layout>
            <Frame.Section>
              <Content title="Checks">
                <Check<{ token: string }>
                  check={() => loginPromise}
                  ok={(conf) => {
                    return (
                      <span>
                        Login OK as <strong>kennedy.mweene</strong>
                      </span>
                    );
                  }}
                  fail={() => (
                    <span>
                      Failed to login as <strong>kennedy.mweene</strong>
                    </span>
                  )}
                  instructions={
                    <span>
                      Try running `yarn db:backup:restore` in your country
                      config repository. This command loads a previous backup of
                      the database.
                    </span>
                  }
                />
                <Check<{ COUNTRY: string }>
                  check={getCountryConfig}
                  ok={(conf) => {
                    return <span>Country config {conf.COUNTRY}</span>;
                  }}
                  fail={() => <span>Country config not running</span>}
                  instructions={
                    <span>
                      Go to your country config repository (opencrvs-farajaland
                      or opencrvs-your-country) and run{" "}
                      <strong>yarn dev</strong>.
                    </span>
                  }
                />
                <Check
                  check={getHearthLocations}
                  ok={(conf) => {
                    return <span>OpenHIM channels set up</span>;
                  }}
                  fail={() => (
                    <span>Your OpenHIM doesn't have any channels.</span>
                  )}
                  instructions={
                    <span>
                      Try running <strong>yarn db:backup:restore</strong> in
                      your country config repository.
                    </span>
                  }
                />
                <Check
                  check={async () => {
                    const data = await getHearthLocations();

                    if (!data.total || data.total === 0) {
                      throw new Error("No locations found");
                    }
                  }}
                  ok={(conf) => {
                    return <span>There are locations in Hearth</span>;
                  }}
                  fail={() => (
                    <span>No locations in Hearth's Locations collection.</span>
                  )}
                  instructions={
                    <span>
                      Try running <strong>yarn db:backup:restore</strong> in
                      your country config repository.
                    </span>
                  }
                />
              </Content>
            </Frame.Section>

            <Frame.Section>
              <Box>
                <Text variant="h4" element="span">
                  Services
                </Text>
                <ul>
                  {Object.values(services)
                    .filter((s) => s.type === "service")
                    .map((service) => (
                      <li key={service.name} className="service">
                        <span className="service-name">{service.name}</span>
                        {service.status === "LOADING" ? (
                          <Spinner id="Loader" size={20} />
                        ) : service.status === "OK" ? (
                          <div className="status">
                            <span style={{ color: "green" }}>
                              {new URL(service.url).port}
                            </span>
                            <StatusGreen />
                          </div>
                        ) : (
                          <div className="status">
                            <span style={{ color: "red" }}>
                              {new URL(service.url).port}
                            </span>
                            <StatusWaitingValidation />
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </Box>
              <Box>
                <Text variant="h4" element="span">
                  Dependencies
                </Text>
                <ul>
                  {Object.values(services)
                    .filter((s) => s.type === "dependency")
                    .map((service) => (
                      <li key={service.name} className="service">
                        <span className="service-name">{service.name}</span>
                        {service.status === "LOADING" ? (
                          <Spinner id="Loader" size={20} />
                        ) : service.status === "OK" ? (
                          <div className="status">
                            <span style={{ color: "green" }}>
                              {new URL(service.url).port}
                            </span>
                            <StatusGreen />
                          </div>
                        ) : (
                          <div className="status">
                            <span style={{ color: "red" }}>
                              {new URL(service.url).port}
                            </span>
                            <StatusWaitingValidation />
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </Box>
            </Frame.Section>
          </Frame.Layout>
        </Frame>
      </div>
    </ThemeProvider>
  );
}

export default App;
