import { createStyles } from "@mantine/emotion";
import { PrimaryNavigation } from "../navigation/navigation";
import { Container } from "@mantine/core";
import Footer from "../footer/footer";

type PageWrapperProps = {
  children?: React.ReactNode;
};

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { classes } = useStyles();
  return (
    <div className="content">
      <PrimaryNavigation />
      <Container px={0} fluid className={classes.mainContent}>
        {children}
      </Container>
      <Footer />
    </div>
  );
};

const useStyles = createStyles(() => ({
  mainContent: {
    marginTop: "10px",
  },
}));
