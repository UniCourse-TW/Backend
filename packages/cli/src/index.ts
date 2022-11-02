#!/usr/bin/env node
import { program } from "commander";
import whoami from "./commands/whoami";
import login from "./commands/login";
import logout from "./commands/logout";

program
    .addCommand(whoami)
    .addCommand(login)
    .addCommand(logout)
    .parse();
