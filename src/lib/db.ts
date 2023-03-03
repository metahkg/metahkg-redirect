import { MongoClient } from "mongodb";
import { config } from "./config";

export const client = new MongoClient(config.MONGO_URI);

export const db = client.db("metahkg-redirect");

export const malwareUrlsCl = db.collection("malware-urls");
export const malwareHostsCl = db.collection("malware-hosts");
