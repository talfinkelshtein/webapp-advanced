import initApp from "./server.js";
const port = process.env.PORT;

initApp().then((app) => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
});