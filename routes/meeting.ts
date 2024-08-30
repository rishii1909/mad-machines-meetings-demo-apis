import express from "express";
import { Meeting } from "../models/Meeting";
import { IMember, Member } from "../models/Member";
import { Room } from "../models/Room";

const ERROR_INVALID_TIME_RANGE = "Invalid time range";

export const meetingRouter = express.Router();

interface CreateMeetingReqProps {
  name: string;
  participantIds: string[];
  roomId: string;
  from: number;
  to: number;
}
meetingRouter.post("/meetings/create", async (req, res) => {
  try {
    const { name, participantIds, roomId, from, to }: CreateMeetingReqProps =
      req.body;

    if (!participantIds.length) {
      return res.status(400).json({
        error: "No participants given for this meeting",
      });
    }
    if (!roomId) {
      return res.status(400).json({
        error: "No room specified for this meeting",
      });
    }

    // Validate time range
    if (from >= to) {
      return res.status(400).json({ error: ERROR_INVALID_TIME_RANGE });
    }

    const roomAlreadyHasMeetings = !!(await Meeting.findOne({
      room: roomId,
      $or: [{ from: { $lt: to } }, { to: { $gt: from } }],
    }));

    if (roomAlreadyHasMeetings) {
      return res.status(400).json({
        error: "The selected room is already booked during this time slot.",
      });
    }

    const participants = await Member.find({ _id: { $in: participantIds } });

    // Check if any participant is double-booked
    const { participantsAlreadyInMeetings } =
      await getParticipantsAlreadyInMeeting(participants, from, to);

    if (participantsAlreadyInMeetings.length > 0) {
      return res.status(400).json({
        error: `Members ${participantsAlreadyInMeetings
          .map((p) => p.name)
          .join(", ")} already booked for another meeting in this slot.`,
      });
    }

    const room = await Room.findById(roomId);

    // Create the meeting
    const meeting = new Meeting({
      name,
      participants,
      room: room?.id,
      from,
      to,
    });
    await meeting.save();

    return res.status(201).json(meeting);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the meeting" });
  }
});

const getParticipantsAlreadyInMeeting = async (
  participants: IMember[],
  from: number,
  to: number
): Promise<{ participantsAlreadyInMeetings: IMember[] }> => {
  const participantsAlreadyInMeetings: IMember[] = [];

  if (participants.length === 0) return { participantsAlreadyInMeetings };

  const alreadyOccupiedMeetings = await Meeting.find({
    participants: {
      $in: participants,
    },
    $or: [{ from: { $lt: to }, to: { $gt: from } }],
  });

  const { participantsMap } = makeParticipantsMap(participants);

  // Populate participantIdsAlreadyInMeetings
  alreadyOccupiedMeetings.map((meeting) =>
    meeting.participants.map((participant) => {
      const participantInMap = participantsMap[participant._id.toString()];

      if (participantInMap)
        participantsAlreadyInMeetings.push(participantInMap);
    })
  );

  return { participantsAlreadyInMeetings };
};

interface IParticipantsMap {
  [memberId: string]: IMember;
}
interface MakeParticipantsMapReturn {
  participantsMap: IParticipantsMap;
}
const makeParticipantsMap = (
  participants: IMember[]
): MakeParticipantsMapReturn => {
  const participantsMap: IParticipantsMap = {};

  participants.map(
    (participant) => (participantsMap[<string>participant._id] = participant)
  );

  return { participantsMap };
};

interface CheckAvailabilityReqProps {
  roomId?: string;
  participantIds?: string[];
  from: number;
  to: number;
}
meetingRouter.post("/meetings/availability", async (req, res) => {
  try {
    const { roomId, participantIds, from, to }: CheckAvailabilityReqProps =
      req.body;

    if (from >= to) {
      return res
        .status(400)
        .json({ success: false, message: ERROR_INVALID_TIME_RANGE });
    }

    if (!roomId && (!participantIds || participantIds.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least roomId or participantIds must be provided.",
      });
    }

    const roomAvailable =
      !roomId ||
      !(await Meeting.findOne({
        room: roomId,
        $or: [{ from: { $lt: to } }, { to: { $gt: from } }],
      }));

    const participants = await Member.find({ _id: { $in: participantIds } });
    const { participantsAlreadyInMeetings } =
      await getParticipantsAlreadyInMeeting(participants, from, to);

    const participantsAvailable =
      !participantIds ||
      participantIds.length === 0 ||
      participantsAlreadyInMeetings.length === 0;

    const messages: string[] = [];

    if (roomId && !roomAvailable) {
      messages.push(
        "The selected room is already booked during this time slot."
      );
    }

    if (participantIds && participantIds.length > 0 && !participantsAvailable) {
      messages.push(
        `Members ${participantsAlreadyInMeetings
          .map((p) => p.name)
          .join(", ")} are already booked for another meeting in this slot.`
      );
    }

    return res.status(200).json({
      success: roomAvailable && participantsAvailable,
      message: messages.length
        ? messages.join(" ")
        : "Both room and participants are available.",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking availability.",
    });
  }
});
