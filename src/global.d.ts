import { Connection } from "mongoose";

declare global{
    var mongoConn:{
        conn : Connection | null;
        promise : Promise<Connection> | null;
    }
}

export {};
