require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const sequelize = require("./models");
const tripsRouter = require("./routes/tripsRoutes");
const usersRouter = require("./routes/usersRoutes");
const activitiesRouter = require("./routes/activitiesRoutes");
const invitationsRouter = require("./routes/invitationsRoutes");
const itinerariesRouter = require("./routes/itinerariesRoutes");
const pollsRouter = require("./routes/pollsRoutes");
const pollOptionsRouter = require("./routes/pollOptionsRoutes");
const tripParticipantsRouter = require("./routes/tripParticipantsRoutes");
const votesRouter = require("./routes/votesRoutes");
const expensesRouter = require("./routes/expensesRoutes");
const expensesParticipantsRouter = require("./routes/expensesParticipantsRoutes");
const aiRouter = require("./routes/aiRoutes");


app.use(cors());

app.use(express.json());
app.use("/trips", tripsRouter);
app.use("/users", usersRouter);
app.use("/trips", tripsRouter);
app.use("/users", usersRouter);
app.use("/activities", activitiesRouter);
app.use("/invitations", invitationsRouter);
app.use("/itineraries", itinerariesRouter);
app.use("/polls", pollsRouter);
app.use("/poll-options", pollOptionsRouter);
app.use("/trip-participants", tripParticipantsRouter);
app.use("/votes", votesRouter);
app.use("/expenses", expensesRouter);
app.use("/expense-participants", expensesParticipantsRouter);
app.use("/AI", aiRouter);


const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(() => {
    console.log("Base de datos sincronizada");

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al sincronizar la base de datos:", error);
  });

module.exports = app;