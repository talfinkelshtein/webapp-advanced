import fs from "fs";
import https from "https";
import initApp from "./server";

const port = process.env.PORT;
const domain = process.env.DOMAIN_BASE;

initApp().then((app) => {
  if (process.env.NODE_ENV != "production") {
    app.listen(port, () => {
      console.log(`Example app listening at ${domain}:${port}`);
    });
  } else {
    const prop = {
      key: fs.readFileSync("../client-key.pem"),
      cert: fs.readFileSync("../client-cert.pem")
    }
    https.createServer(prop, app).listen(port)
  }
});
