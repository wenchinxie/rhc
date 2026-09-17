import { serve } from "bun";
import index from "./index.html";
import grokBot from "./grok-bot.html";
import lauren from "./lauren.html";
import laurenEn from "./lauren-en.html";

const server = serve({
  port: Number(process.env.PORT) || 3010,
  routes: {
    "/": index,
    "/index.html": index,
    "/grok-bot": grokBot,
    "/grok-bot.html": grokBot,
    "/lauren": lauren,
    "/lauren.html": lauren,
    "/lauren-en": laurenEn,
    "/lauren-en.html": laurenEn,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
