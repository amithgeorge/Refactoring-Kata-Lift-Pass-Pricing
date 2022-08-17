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

async function compute_final_price(get_holidays, plan, { type, date, age }) {
  if (type === "night") {
    return compute_price_for_night_pass(plan, { age });
  }

  const holidays = await get_holidays();
  return compute_price_for_non_night_passes(
    compute_day_of_week_discount(holidays, date),
    plan,
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
    const result = (
      await connection.query(
        "SELECT cost FROM `base_price` " + "WHERE `type` = ? ",
        [data.type]
      )
    )[0][0];

    const final_price = await compute_final_price(get_holidays, result, data);
    return res.json({ ...result, cost: final_price });
  });

  return { app, connection };
}

module.exports = { createApp };
