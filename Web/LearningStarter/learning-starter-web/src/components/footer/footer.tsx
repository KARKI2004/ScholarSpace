import { Box, Text, Group, Anchor, Image } from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";
import logo from "../../assets/logo/clearlogo.png";

export default function Footer() {
  return (
    <Box
      component="footer"
      style={{
        width: "100%",
        padding: "5px 0",
        marginTop: "5vh",
        borderTop: "1px solid #797474ff",
      }}
    >
      <Group
        justify="space-between"
        style={{
          width: "100%",
          padding: "0 60px",
          flexWrap: "wrap",
        }}
      >
        <Group>
          <Image
            w={100}
            h={100}
            radius="sm"
            src={logo}
            alt="logo"
            fallbackSrc="https://placehold.co/600x400?text=Placeholder"
          />
        </Group>


        <Group style={{ gap: "25px", flexWrap: "wrap" }}>
          <Anchor
            href="/blog"
            style={{
              textDecoration: "none",
              color: "#83928dff",
              fontSize: "15px",
            }}
          >
            Blogs
          </Anchor>

          <Anchor
            href="/thread"
            style={{
              textDecoration: "none",
              color: "#83928dff",
              fontSize: "15px",
            }}
          >
            Threads
          </Anchor>

          <Anchor
            href="/register"
            style={{
              textDecoration: "none",
              color: "#83928dff",
              fontSize: "15px",
            }}
          >
            Sign up
          </Anchor>

          <Anchor
            href="#"
            style={{
              textDecoration: "none",
              color: "#83928dff",
              fontSize: "15px",
            }}
          >
            Contact
          </Anchor>
        </Group>
      </Group>

      <Group
        style={{
          justifyContent: "center",
          gap: "25px",
          marginTop: "20px",
        }}
      >
        <Anchor
          href="https://facebook.com"
          target="_blank"
          style={{ color: "#80CFA9" }}
        >
          <IconBrandFacebook size={22} />
        </Anchor>

        <Anchor
          href="https://twitter.com"
          target="_blank"
          style={{ color: "#80CFA9" }}
        >
          <IconBrandTwitter size={22} />
        </Anchor>

        <Anchor
          href="https://instagram.com"
          target="_blank"
          style={{ color: "#80CFA9" }}
        >
          <IconBrandInstagram size={22} />
        </Anchor>

        <Anchor
          href="https://linkedin.com"
          target="_blank"
          style={{ color: "#80CFA9" }}
        >
          <IconBrandLinkedin size={22} />
        </Anchor>
      </Group>

      <Text
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "14px",
          color: "#888",
        }}
      >
        © {new Date().getFullYear()} ScholarSpace. All rights reserved.
      </Text>
    </Box>
  );
}