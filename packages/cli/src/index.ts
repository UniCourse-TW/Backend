#!/usr/bin/env node
import { program } from "commander";
import whoami from "./commands/whoami";
import login from "./commands/login";
import register from "./commands/register";
import logout from "./commands/logout";
import status from "./commands/status";
import req from "./commands/req";
import import_file from "./commands/import";

program
    .addCommand(whoami)
    .addCommand(login)
    .addCommand(register)
    .addCommand(logout)
    .addCommand(status)
    .addCommand(req)
    .addCommand(import_file)
    .parse();
