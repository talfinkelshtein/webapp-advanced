import initApp from "./server";

const port = process.env.PORT;
const domain = process.env.DOMAIN_BASE;

initApp().then((app) => {
  app.listen(port, () => {
    console.log(`Example app listening at ${domain}:${port}`);
  });
});
