import type { JSX } from "react";
import {
  AppShell as OxygenAppShell,
  Header,
  Sidebar,
  Footer,
  UserMenu,
  ColorSchemeToggle,
  Divider,
} from "@wso2/oxygen-ui";
import { ArrowRightLeft, LogOut, User } from "@wso2/oxygen-ui-icons-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthz } from "../authz/gates";
import { signOut } from "../authz/session";
import { APP_NAME } from "../appName";
import { SCREEN_ROUTES } from "../authz/screens";

/**
 * The one signed-in shell every gated route renders inside — wireframes.dsl
 * draws the same navbar + implicit chrome on the Converter screen. A "Sign
 * out" item leaves the app the platform's own way and carries no navigation
 * arrow (wireframes: sign-out leaves the app the same way sign-in does).
 */
export function AppShell(): JSX.Element {
  const { pathname } = useLocation();
  const { username } = useAuthz();
  const active = SCREEN_ROUTES.find((screen) => pathname.startsWith(screen.path))?.key ?? "converter";

  return (
    <OxygenAppShell>
      <OxygenAppShell.Navbar>
        <Header minimal>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={username || "Signed in"} />
              <UserMenu.Header name={username || "Signed in"} email="" />
              <UserMenu.Item icon={<User />} label="Profile" onClick={() => {}} />
              <UserMenu.Divider />
              <UserMenu.Logout icon={<LogOut />} onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </OxygenAppShell.Navbar>

      <OxygenAppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.Item id="converter" link={<Link to="/converter" />}>
                <Sidebar.ItemIcon>
                  <ArrowRightLeft />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Converter</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </OxygenAppShell.Sidebar>

      <OxygenAppShell.Main>
        <Outlet />
      </OxygenAppShell.Main>

      <OxygenAppShell.Footer>
        <Footer>
          <Footer.Copyright>© {new Date().getFullYear()} WSO2 LLC.</Footer.Copyright>
        </Footer>
      </OxygenAppShell.Footer>
    </OxygenAppShell>
  );
}
