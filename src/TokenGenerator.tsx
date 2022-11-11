import "./App.css";
import {
  Content,
  Frame,
  InputField,
  TextArea,
} from "@riku/opencrvs-components";

import { Navigation } from "./Navigation";
import { useEffect, useState } from "react";
import { login } from "./checks";
import styled from "styled-components";

const Textarea = styled(TextArea)`
  width: 100%;
  height: 400px;
`;

export function TokenGenerator() {
  const [token, setToken] = useState("");

  useEffect(() => {
    login().then((data) => {
      setToken(data.token);
    });
  }, []);

  return (
    <Frame navigation={<Navigation />} header={null} skipToContentText={""}>
      <Frame.Layout>
        <Frame.Section>
          <Content title="Auth token generator">
            <InputField
              id=""
              label={
                (
                  <span>
                    Token for <strong>kennedy.mweene</strong>
                  </span>
                ) as unknown as string
              }
              touched={false}
            >
              <Textarea {...({ value: token } as any)} />
            </InputField>
          </Content>
        </Frame.Section>
      </Frame.Layout>
    </Frame>
  );
}
