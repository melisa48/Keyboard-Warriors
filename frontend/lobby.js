import socket from "./common_utilities/socket";
import { chatItemCreatedHandler } from "./common_utilities/chat";
import { gameCreatedHandler } from "./games/created";

gameCreatedHandler(socket);
chatItemCreatedHandler(socket);
