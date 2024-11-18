import { fromWebHandler } from "vinxi/http";
import { app } from ".";

export default fromWebHandler(app.handle);
