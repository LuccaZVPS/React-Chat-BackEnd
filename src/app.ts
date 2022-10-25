import { ISocketUser } from "./types/ISocketUser";
import express from "express";
require("dotenv").config();
import cors from "cors";
import "./database/mongoose";
import routes from "./routes";
import { Application } from "express";
import User from "./models/user";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getRequestsInfo } from "./services/userDataServices";
import Message from "./models/message";

class App {
  server: Application;
  io: Server;
  constructor() {
    this.io = new Server(8000, {
      cors: { origin: process.env.CLIENT_SIDE_URL },
      pingTimeout: 120000,
      pingInterval: 30000,
    });
    this.server = express();
    this.middleware();
    this.socket();
    this.router();
  }

  private middleware() {
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));

    this.server.use(cors({ origin: process.env.CLIENT_SIDE_URL }));
  }
  public router() {
    this.server.use(routes);
  }
  private socket() {
    var usersOnline: ISocketUser[] = [] as ISocketUser[];
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token as string;
        const isLegit = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as token;
        if (isLegit) {
          socket.data = { id: isLegit.id };
          const isInList = usersOnline.filter(
            (user) => user.socketId === socket.id
          );
          if (isInList.length === 0) {
            usersOnline.push({ socketId: socket.id, id: socket.data.id });
          }

          next();
        }
      } catch {
        return;
      }
    });

    this.io.on("connection", (socket) => {
      try {
        socket.on("disconnect", () => {
          if (!socket.disconnected) {
            return;
          }

          usersOnline = usersOnline.filter(
            (user) => user.socketId !== socket.id
          );
        });

        socket.on("send-request", async (id: string) => {
          const isOnline = usersOnline.filter((user) => user.id === id);

          if (isOnline.length === 0) {
            return;
          }

          const user = await User.findById(id);
          if (!user) {
            return;
          }

          if (!user.requests?.includes(socket.data.id)) {
            return;
          }
          const requestdata = await getRequestsInfo([socket.data.id]);
          if (!requestdata) {
            return;
          }

          isOnline.forEach(({ socketId }) => {
            socket.to(socketId).emit("new-request", requestdata[0]);
          });
        });

        socket.on("friend-accepted", async (id: string) => {
          const isOnline = usersOnline.filter((user) => user.id === id);
          if (isOnline.length === 0) {
            return;
          }

          const user = await User.findById(id);
          if (!user) {
            return;
          }

          if (!user.friends?.includes(socket.data.id)) {
            return;
          }
          const requestdata = await getRequestsInfo([socket.data.id]);
          if (!requestdata) {
            return;
          }
          isOnline.forEach(({ socketId }) => {
            socket.to(socketId).emit("new-friend", requestdata[0]);
          });
        });

        socket.on("message-sent", async (id: string) => {
          const message = await Message.findById(id);
          if (!message?.users) {
            return;
          }

          if (message.users.length !== 2) {
            return;
          }

          if (message.users[0] !== socket.data.id) {
            return;
          }

          const to = message.users[1];
          const isOnline = usersOnline.filter((user) => user.id === to);
          isOnline.forEach(({ socketId }) => {
            socket.to(socketId).emit("new-message", message);
          });
        });
      } catch {}
    });
  }
}
export default new App().server;

interface token {
  id: string;
}
