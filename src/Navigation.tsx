import "./App.css";
import {
  LeftNavigation,
  NavigationItem,
  NavigationGroup,
} from "@riku/opencrvs-components";

import { Icon } from "@riku/opencrvs-components/lib/Icon";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const navigate = useNavigate();
  return (
    <LeftNavigation
      applicationName="OpenCRVS DevTool"
      applicationVersion="Dev"
      buildVersion="abc"
    >
      <NavigationGroup>
        <NavigationItem
          icon={() => <Icon name="Activity" />}
          label="My environment"
          onClick={() => navigate("/")}
        />
        <NavigationItem
          icon={() => <Icon name="Key" />}
          label="Token generator"
          onClick={() => navigate("/token")}
        />
      </NavigationGroup>
    </LeftNavigation>
  );
}
