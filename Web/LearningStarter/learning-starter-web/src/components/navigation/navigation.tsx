import React, { useEffect, useState } from "react";
import { routes } from "../../routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  Menu,
  Image,
  Container,
  Group,
  useMantineColorScheme,
  Button,
  Flex,
  Avatar,
  Title,
} from "@mantine/core";
import { NAVBAR_HEIGHT } from "../../constants/theme-constants";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logo/clearlogo.png";
import { useAuth } from "../../authentication/use-auth";
import { createStyles } from "@mantine/emotion";

type PrimaryNavigationProps = {};

type NavigationItem = {
  text: string;
  icon?: IconProp;
  hide?: boolean;
  to: string;
};

const DesktopNavigation: React.FC<{ user?: any }> = ({ user }) => {
  const { classes, cx } = useStyles();
  const { pathname } = useLocation();

  const navigation: NavigationItem[] = [
    { text: "Home", to: routes.home },
    { text: "Blogs", to: routes.blog },
    { text: "Threads", to: routes.threads },
    { text: "Profile", to: routes.profile, hide: !user },
    { text: "Admin", to: routes.adminPage, hide: user?.role !== "Admin" },
    { text: "Join Now", to: routes.userRegistration, hide: !!user },
  ];

  const [active, setActive] = useState(navigation[0].to);

  useEffect(() => setActive(pathname), [pathname]);

  return (
    <Container px={0} className={classes.desktopNav}>
      <Flex
        direction="row"
        align="center"
        justify="center"
        className={classes.fullHeight}
      >
        {navigation
          .filter((x) => !x.hide)
          .map((x, i, arr) => (
            <React.Fragment key={i}>
              <Button
                size="md"
                component={NavLink}
                to={x.to}
                className={cx(classes.paddedMenuItem, {
                  [classes.linkActive]: active === x.to,
                })}
                variant="subtle"
              >
                {x.icon && <FontAwesomeIcon icon={x.icon} />} {x.text}
              </Button>
            </React.Fragment>
          ))}
      </Flex>
    </Container>
  );
};

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = () => {
  const { classes } = useStyles();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Title order={4}>
      <Container px={20} fluid>
        <Flex
          direction="row"
          justify="space-between"
          align="center"
          style={{ width: "100%" }}
        >
          <Group>
            <NavLink to={routes.root}>
              <Image
                className={classes.logo}
                radius="sm"
                fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                src={logo}
                alt="logo"
              />
            </NavLink>
          </Group>
          <DesktopNavigation user={user} />
          <Group>
            {user ? (
              <Menu>
                <Menu.Target>
                  <Avatar className={classes.pointer}>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => toggleColorScheme()}>
                    {dark ? "Light mode" : "Dark mode"}
                  </Menu.Item>
                  <Menu.Item onClick={() => logout()}>Sign Out</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button component={NavLink} to={routes.login} color="green">
                Login
              </Button>
            )}
          </Group>
        </Flex>
      </Container>
    </Title>
  );
};

const useStyles = createStyles((theme) => ({
  pointer: { cursor: "pointer" },
  logo: {
    cursor: "pointer",
    marginRight: "5px",
    paddingTop: "4px",
    height: NAVBAR_HEIGHT,
  },
  paddedMenuItem: { margin: "0px 5px" },
  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.variantColorResolver({
        theme,
        color: theme.primaryColor,
        variant: "light",
      }).background,
      color: theme.variantColorResolver({
        theme,
        color: theme.primaryColor,
        variant: "light",
      }).color,
    },
  },
  desktopNav: { height: NAVBAR_HEIGHT },
  fullHeight: { height: "100%" },
}));
