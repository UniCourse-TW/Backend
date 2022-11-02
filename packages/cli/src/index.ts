#!/usr/bin/env node
import { program } from "commander";
import whoami from "./commands/whoami";
import login from "./commands/login";
import logout from "./commands/logout";
import status from "./commands/status";

program
    .addCommand(whoami)
    .addCommand(login)
    .addCommand(logout)
    .addCommand(status)
    .parse();
