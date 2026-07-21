import mongoose from "mongoose";

const mongoDB_Url = process.env.MONGODB_URL;

if (!mongoDB_Url) {
  throw new Error("MongoDB URL not found!!");
}

// mereko mongodb conn ko cached karna padega next js me => due to hot reload in dev env => leads to to many  mongo connections

let cached = global.mongoConn;

// Agar pehli baar chal raha hai (toh cached nahi hoga), toh usko default set kar do
if (!cached) {
  cached = global.mongoConn = { conn: null, promise: null };
}

export async function connectDB() {
  // Agar connection pehle se hai, toh wahi purana use karo (Naya mat banao)
  if (cached.conn) {
    console.log("Purana connection use ho raha hai");
    return cached.conn;
  }

  // Agar promise nahi hai (matlab ab tak connect karna start hi nahi kiya)
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoDB_Url!).then((mongoose) => {
      return mongoose.connection;
    });
  }

  // Connection ka wait karo aur usko global var mein save kar do
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Error occur while connecting to DB", error);

    cached.promise = null; //ye imp h agr fake promise store ho gya toh
    throw error;// ye imp h
  }
}
