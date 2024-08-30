import express, { Request, Response } from "express";
import { IRoom, Room } from "../models/Room";

const ERROR_ROOM_NOT_FOUND = "Room not found";

export const roomRouter = express.Router();

type CreateRoomReqProps = IRoom;

// Create a new room
roomRouter.post("/rooms", async (req: Request, res: Response) => {
  try {
    const { name }: CreateRoomReqProps = req.body;

    const existingRoomWithName = await Room.findOne({ name });

    if (existingRoomWithName) {
      return res
        .status(409)
        .json({ message: "Room with this name already exists" });
    }

    const room = new Room({ name });
    await room.save();

    res.status(201).json(room);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Read all rooms
roomRouter.get("/rooms", async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Read a single room by ID
roomRouter.get("/rooms/:_id", async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params._id);
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a room by ID
roomRouter.put("/rooms/:_id", async (req: Request, res: Response) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params._id, req.body, {
      new: true,
      runValidators: true,
    });
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a room by ID
roomRouter.delete("/rooms/:_id", async (req: Request, res: Response) => {
  try {
    const room = await Room.findByIdAndDelete(req.params._id);
    if (room) {
      res.status(200).json({ message: "Room deleted" });
    } else {
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
