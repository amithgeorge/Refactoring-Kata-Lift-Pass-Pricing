const express = require("express");
const mysql = require("mysql2/promise");

function compute_day_of_week_discount(holidays, date) {
  if (!date) {
    return 0;
  }

  date = new Date(date);

  let isHoliday = false;
  let reduction = 0;

  for (let row of holidays) {
    let holiday = row.holiday;
    if (
      date.getFullYear() === holiday.getFullYear() &&
      date.getMonth() === holiday.getMonth() &&
      date.getDate() === holiday.getDate()
    ) {
      isHoliday = true;
      break;
    }
  }

  if (!isHoliday && date.getDay() === 1) {
    reduction = 35;
  }

  return reduction;
}

function compute_price_for_night_pass({ cost }, { age }) {
  if (age === undefined || age < 6) {
    return 0;
  }

  if (age > 64) {
    return Math.ceil(cost * 0.4);
  }

  return cost;
}

function compute_price_for_non_night_passes(
  day_of_week_discount,
  pass,
  { age }
) {
  // TODO apply reduction for others
  if (age === undefined) {
    let cost = pass.cost * (1 - day_of_week_discount / 100);
    return Math.ceil(cost);
  }

  if (age < 6) {
    return 0;
  }

  if (age < 15) {
    return Math.ceil(pass.cost * 0.7);
  }

  if (age > 64) {
    let cost = pass.cost * 0.75 * (1 - day_of_week_discount / 100);
    return Math.ceil(cost);
  }

  let cost = pass.cost * (1 - day_of_week_discount / 100);
  return Math.ceil(cost);
}

async function compute_final_price(
  get_pass,
  get_holidays,
  { type, date, age }
) {
  // Originally this function was accepting as arguments, the pass and the list of holidays.
  // I am making an assumption that it is very expensive to get the pass and to get the list of holidays from the db.
  // The assumption is not based in reality, however I wanted to see how the code would change to accomodate it.
  // This is the "optimized" version, where we fetch the pass and the holidays only when needed.

  if (age < 6) {
    // if age is < 6, it doesn't matter which pass or which day of week. it always costs 0.
    return 0;
  }

  const pass = await get_pass(type);
  if (pass.type === "night") {
    return compute_price_for_night_pass(pass, { age });
  }

  const holidays = await get_holidays();
  return compute_price_for_non_night_passes(
    compute_day_of_week_discount(holidays, date),
    pass,
    {
      age,
    }
  );
}

async function createApp() {
  const app = express();

  let connectionOptions = {
    host: "localhost",
    user: "root",
    database: "lift_pass",
    password: "mysql",
  };
  const connection = await mysql.createConnection(connectionOptions);

  async function get_holidays() {
    return (await connection.query("SELECT * FROM `holidays`"))[0];
  }

  async function get_pass(type) {
    return (
      await connection.query(
        "SELECT cost, type FROM `base_price` " + "WHERE `type` = ? ",
        [type]
      )
    )[0][0];
  }

  app.put("/prices", async (req, res) => {
    const liftPassCost = req.query.cost;
    const liftPassType = req.query.type;
    const [rows, fields] = await connection.query(
      "INSERT INTO `base_price` (type, cost) VALUES (?, ?) " +
        "ON DUPLICATE KEY UPDATE cost = ?",
      [liftPassType, liftPassCost, liftPassCost]
    );

    res.json();
  });

  app.get("/prices", async (req, res) => {
    const data = req.query;
    const final_price = await compute_final_price(get_pass, get_holidays, data);
    return res.json({ cost: final_price });
  });

  return { app, connection };
}

module.exports = { createApp };
