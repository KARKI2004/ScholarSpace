import { ApiResponse } from "../../constants/types";
import { useAsyncFn } from "react-use";
import { FormErrors, useForm } from "@mantine/form";
import {
  Alert,
  Button,
  Container,
  Input,
  Text,
  Paper,
  Title,
  Group,
} from "@mantine/core";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { createStyles } from "@mantine/emotion";
import { useNavigate } from "react-router-dom";
import spacebook from "../../assets/bg-image/spacebook.jpg";

type LoginRequest = {
  userName: string;
  password: string;
};

type LoginResponse = ApiResponse<boolean>;

export const LoginPage = ({
  fetchCurrentUser,
}: {
  fetchCurrentUser: () => void;
}) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const form = useForm<LoginRequest>({
    initialValues: {
      userName: "",
      password: "",
    },
    validate: {
      userName: (value) =>
        value.length <= 0 ? "Username must not be empty" : null,
      password: (value) =>
        value.length <= 0 ? "Password must not be empty" : null,
    },
  });

  const [, submitLogin] = useAsyncFn(async (values: LoginRequest) => {
    const response = await api.post<LoginResponse>(`/api/authenticate`, values);

    if (response.data.hasErrors) {
      const formErrors: FormErrors = response.data.errors.reduce(
        (prev, curr) => {
          Object.assign(prev, { [curr.property]: curr.message });
          return prev;
        },
        {} as FormErrors
      );
      form.setErrors(formErrors);
    }

    if (response.data.data) {
      showNotification({ message: "Successfully Logged In!", color: "green" });
      navigate("/home");
      fetchCurrentUser();
    }
  }, []);

  return (
    <>
      <div className={classes.background}></div>
      <Container size="xs" className={classes.wrapper}>
        <Paper radius="md" p="xl" withBorder className={classes.card}>
          <Title order={2} ta="center" className={classes.title}>
            Welcome Back, Scholar!
          </Title>
          <Text ta="center" c="dimmed" mb="lg">
            Sign In to write, read, and inspire.
          </Text>

          {form.errors[""] && (
            <Alert className={classes.generalErrors} color="red">
              <Text>{form.errors[""]}</Text>
            </Alert>
          )}

          <form onSubmit={form.onSubmit(submitLogin)}>
            <div className={classes.field}>
              <label className={classes.label}>Username</label>
              <Input
                size="md"
                radius="md"
                className={classes.input}
                {...form.getInputProps("userName")}
              />
              <Text c="red" size="xs">
                {form.errors["userName"]}
              </Text>
            </div>

            <div className={classes.field}>
              <label className={classes.label}>Password</label>
              <Input
                size="md"
                type="password"
                radius="md"
                className={classes.input}
                {...form.getInputProps("password")}
              />
              <Text c="red" size="xs">
                {form.errors["password"]}
              </Text>
            </div>

            <Group justify="center" mt="lg">
              <Button
                className={classes.loginButton}
                type="submit"
                size="md"
                radius="md"
              >
                Login
              </Button>
              <Text size="sm" ta="center" mt="md">
                If you don't already have an account,{" "}
                <Text
                  span
                  c="green"
                  style={{ cursor: "pointer", fontWeight: 600 }}
                  onClick={() => navigate("/register")}
                >
                  Join Now
                </Text>
                .
              </Text>
            </Group>
          </form>
        </Paper>
      </Container>
    </>
  );
};

const useStyles = createStyles(() => ({
  background: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${spacebook})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -1,

    "&::before": {
      content: '""',
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      backdropFilter: "blur(6px)",
      background: "rgba(0,0,0,0.35)",
      zIndex: -1,
    },
  },

  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    transform: "translateY(-60px)",
  },

  card: {
    width: "50vw",
    minHeight: "55vh",
    backdropFilter: "none",
    position: "relative",
    zIndex: 3,
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    borderColor: "#dfe7e3",
    transition: "0.3s ease",

    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 22px rgba(0,0,0,0.12)",
    },
  },

  title: { fontWeight: 800, color: "#64db84ff" },

  label: {
    fontSize: "14px",
    marginBottom: "4px",
    fontWeight: 600,
    color: "#61c799ff",
  },

  input: {
    borderColor: "#aac7b6 !important",
    "&:focus-within": {
      borderColor: "#48b57e !important",
      boxShadow: "0 0 0 2px rgba(56,178,126,0.25)",
    },
  },

  field: { marginBottom: "20px" },

  loginButton: {
    width: "100%",
    backgroundColor: "#48b57e",
    transition: "0.25s ease",
    "&:hover": { backgroundColor: "#3a9a68" },
  },

  generalErrors: { marginBottom: "10px" },
}));
