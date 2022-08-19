import React from "react";
import { makeStyles } from "tss-react/mui";
import FooterItem from "./FooterItem";

const useStyles = makeStyles()((theme) => ({
  footer: {
    backgroundColor: theme.palette.primary.main,
  },
  footerContent: {
    margin: "auto",
    maxWidth: "1200px",
    padding: "6px",
  },
  list: {
    marginBlockStart: "0",
    marginBlockEnd: "0",
    overflow: "hidden",
  },
}));

const data = [
  {
    icon: "icons8-mail-96.png",
    text: "footer.author",
    link: "mailto:michalkubrak.90@gmail.com",
  },
  {
    icon: "icons8-attach-gif-96.png",
    text: "footer.icons",
    link: "https://icons8.com/",
  },
  {
    icon: "icons8-github-96.png",
    text: "footer.git",
    link: "https://github.com/Crusnikos/markasplayed",
  },
];

export default function Footer(): JSX.Element {
  const { classes } = useStyles();

  return (
    <footer className={classes.footer}>
      <div className={classes.footerContent}>
        <ul className={classes.list}>
          {data.map((item) => (
            <FooterItem
              key={item.icon}
              icon={item.icon}
              text={item.text}
              link={item.link}
            />
          ))}
        </ul>
      </div>
    </footer>
  );
}
