import mongoose from "mongoose";

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("MongoDB conectado");
  } catch (e) {
    console.log(e);
  }
}
export default connect();
