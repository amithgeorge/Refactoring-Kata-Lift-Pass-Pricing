const express = require("express");
const mysql = require("mysql2/promise");

async function createApp() {
  const app = express();

  let connectionOptions = {
    host: "localhost",
    user: "root",
    database: "lift_pass",
    password: "mysql",
  };
  const connection = await mysql.createConnection(connectionOptions);

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

    if (data.age < 6) {
      res.json({ cost: 0 });
      return;
    }

    if (data.type === "night") {
      if (data.age >= 6) {
        if (data.age > 64) {
          res.json({ cost: Math.ceil(result.cost * 0.4) });
        } else {
          res.json(result);
        }
      } else {
        res.json({ cost: 0 });
      }
      return;
    }

    if (data.type !== "night") {
      const holidays = (await connection.query("SELECT * FROM `holidays`"))[0];

      let isHoliday;
      let reduction = 0;
      for (let row of holidays) {
        let holiday = row.holiday;
        if (data.date) {
          let d = new Date(data.date);
          if (
            d.getFullYear() === holiday.getFullYear() &&
            d.getMonth() === holiday.getMonth() &&
            d.getDate() === holiday.getDate()
          ) {
            isHoliday = true;
          }
        }
      }

      if (!isHoliday && new Date(data.date).getDay() === 1) {
        reduction = 35;
      }

      // TODO apply reduction for others
      if (data.age < 15) {
        res.json({ cost: Math.ceil(result.cost * 0.7) });
      } else {
        if (data.age === undefined) {
          let cost = result.cost * (1 - reduction / 100);
          res.json({ cost: Math.ceil(cost) });
        } else {
          if (data.age > 64) {
            let cost = result.cost * 0.75 * (1 - reduction / 100);
            res.json({ cost: Math.ceil(cost) });
          } else {
            let cost = result.cost * (1 - reduction / 100);
            res.json({ cost: Math.ceil(cost) });
          }
        }
      }

      return;
    }
  });

  return { app, connection };
}

module.exports = { createApp };
