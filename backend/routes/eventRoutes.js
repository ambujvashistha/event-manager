const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const Event = require("../db/event");

router.get("/user/:userId", async (req, res) => {
  const events = await Event.find({
    profileIds: req.params.userId,
  }).populate("profileIds", "name timezone");

  res.json(events);
});

router.post("/", async (req, res) => {
  try {
    const { profileIds, start, end, timezone } = req.body;

    if (!profileIds || !start || !end || !timezone) {
      return res.status(400).json({ error: "missing fields" });
    }

    const startUTC = dayjs.tz(start, timezone).utc();
    const endUTC = dayjs.tz(end, timezone).utc();
    const nowUTC = dayjs().utc();

    if (startUTC.isSameOrBefore(nowUTC)) {
      return res.status(400).json({ error: "event cannot start in past" });
    }

    if (endUTC.isSameOrBefore(startUTC)) {
      return res.status(400).json({ error: "end must be after start" });
    }

    const event = await Event.create({
      profileIds,
      startUTC: startUTC.toDate(),
      endUTC: endUTC.toDate(),
      createdAtUTC: nowUTC.toDate(),
      updatedAtUTC: nowUTC.toDate(),
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:eventId", async (req, res) => {
  const { start, end, timezone: tz } = req.body;

  if (!start || !end || !tz)
    return res.status(400).json({ error: "missing fields" });

  const startUTC = dayjs.tz(start, tz).utc();
  const endUTC = dayjs.tz(end, tz).utc();
  const nowUTC = dayjs().utc();

  if (endUTC.isSameOrBefore(startUTC))
    return res.status(400).json({ error: "invalid time range" });

  if (startUTC.isBefore(nowUTC))
    return res.status(400).json({ error: "event cannot start in past" });

  const event = await Event.findByIdAndUpdate(
    req.params.eventId,
    {
      startUTC: startUTC.toDate(),
      endUTC: endUTC.toDate(),
      updatedAtUTC: nowUTC.toDate(),
    },
    { new: true }
  );

  res.json(event);
});

router.delete("/:eventId", async (req, res) => {
  await Event.findByIdAndDelete(req.params.eventId);
  res.json({ success: true });
});

module.exports = router;
