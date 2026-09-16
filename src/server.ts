import { Server } from "http";
import app from "./app";
import config from "./config";
0;

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log(`server is runing in port ${config.port}`);
  });
}
main();
