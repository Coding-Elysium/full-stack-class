import express from "express";
import cors from "cors";
import { config as configDotenv } from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
configDotenv();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

console.log(client);

async function run() {
  try {
    await client.connect();

    const database = client.db("classes-master");
    const userCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const cartCollection = database.collection("cart");
    const paymentCollection = database.collection("payments");
    const enrollmentCollection = database.collection("enrolled");
    const appliedCollection = database.collection("applied");

    //routes

    //Post one Data
    app.post("/newClasses", async (req, res) => {
      const newClass = req.body;
      try {
        const result = await classesCollection.insertOne(newClass);
        res.send(result).status(200);
      } catch (error) {
        res.send(result).status(500);
      }
    });
    //Get all the Denied Status
    app.get("/classesDenied", async (req, res) => {
      const request = { status: "denied" };
      try {
        const result = await classesCollection.find(request).toArray();
        res.send(result).status(200);
      } catch (error) {
        res.send(result).status(500);
      }
    });
    //Get all the Approve Status
    app.get("/classesApprove", async (req, res) => {
      const request = { status: "approved" };
      try {
        const result = await classesCollection.find(request).toArray();
        res.send(result).status(200);
      } catch (error) {
        res.send(result).status(500);
      }
    });
    //Get all the data of the email who is given
    app.get("/classes/:email", async (req, res) => {
      const request = req.params.email;
      const query = { instructorEmail: request };
      try {
        const userEmail = await classesCollection.find(query).toArray();
        res.send(userEmail).status(200);
        console.log(userEmail);
      } catch (error) {
        res.send(userEmail).status(500);
      }
    });

    //Get all the Data in classes collection
    app.get("/classes", async (req, res) => {
      try {
        const result = await classesCollection.find({}).toArray();
        res.send(result).status(200);
      } catch (error) {
        res.send(result).status(500);
      }
    });

    //Delete one data in classses
    app.delete("/deleteClass/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);

      try {
        const result = await classesCollection.findOneAndDelete({
          _id: objectId,
        });
        console.log(result);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    //Update the status and reason of a single data
    app.put("/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: status,
          reason: reason,
        },
      };
      try {
        const result = await classesCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    //Get a single class
    app.get("/classesSingle/:id", async (req, res) => {
      const request = req.params.id;
      const query = { _id: new ObjectId(request) };
      try {
        const result = await classesCollection.findOne(query);
        res.send(result).status(200);
        console.log(result);
      } catch (error) {
        res.send(result).status(500);
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
