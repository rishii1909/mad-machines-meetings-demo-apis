import express, { Request, Response } from "express";
import { IMember, Member } from "../models/Member";

const ERROR_ROOM_NOT_FOUND = "Member not found";

export const memberRouter = express.Router();

type CreateMemberReqProps = IMember;

// Create a new member
memberRouter.post("/members", async (req: Request, res: Response) => {
  try {
    const { name }: CreateMemberReqProps = req.body;

    const existingMembersWithName = await Member.find({ name });

    if (existingMembersWithName.length > 0)
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });

    const member = new Member({ name });
    await member.save();

    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Read all members
memberRouter.get("/members", async (req: Request, res: Response) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Read a single member by ID
memberRouter.get("/members/:_id", async (req: Request, res: Response) => {
  try {
    const member = await Member.findById(req.params._id);
    if (member) {
      res.status(200).json(member);
    } else {
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a member by ID
memberRouter.put("/members/:_id", async (req: Request, res: Response) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params._id, req.body, {
      new: true,
      runValidators: true,
    });
    if (member) {
      res.status(200).json(member);
    } else {
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a member by ID
memberRouter.delete("/members/:_id", async (req: Request, res: Response) => {
  try {
    const member = await Member.findByIdAndDelete(req.params._id);
    if (member) {
      res.status(200).json({ message: "Member deleted" });
    } else {
      res.status(404).json({ message: ERROR_ROOM_NOT_FOUND });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
