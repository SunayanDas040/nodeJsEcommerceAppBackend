const { default: mongose, default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.DB_URL);
    console.log("Database Connected Succesfully");
  } catch (error) {
    console.log(err);
  }
};

module.exports = dbConnect;
