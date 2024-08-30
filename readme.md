# Meetings scheduler demo app

## Database Design

### Room

Representation of a physical room to book meeting in, only holds `name` field.

### Member

Members that can be added to meetings, only holds `name` field.

### Meeting

A meeting scheduled, has the following schema:

`name` - Name of this meeting

`roomId` - ID of `Room` this meeting is scheduled in.

`participants` - IDs of `Members` that are participants of this meeting.

`from` - _Start-time_ number timestamp for this meeting's scheduled time

`to` - _End-time_ number timestamp for this meeting's scheduled time

Note: Number timestamps have been used because it's more reliable for cross-timezone functionality. Date fields are an option in MongoDB as well, but it's easier to compare dates across different client timezones when defined in Timestamp numbers as a source-of-truth

## APIs Architecture

### For Members

CRUD endpoints defined at `routes/member.ts`

### For Rooms

CRUD endpoints defined at `routes/room.ts`

### For Meetings

Following endpoints defined at `routes/room.ts`:

**POST `/meetings/create`**

Creates a meeting for given participants in a room, for given duration. handles collisions and returns appropriate error responses for both `Room` and `Participant(Member)` conflicts for the given duration.

Takes following params:

- `name`: `string` - name of this meeting.
- `participantIds`: `string[]` - Array of `Member` IDs corresponding to participants of this meeting.
- `roomId`: `string` - ID of the room this meeting is to be scheduled in.
- `from`: `number` - Timestamp of start-time for this meeting
- `to`: `number` - Timestamp of end-time for this meeting

**POST `/meetings/availability`**

Checks if:

1. All `Participants(Members)` are available for the given duration
2. Desired `Room` is available for the given duration

Takes following params:

- `participantIds`: `string[] {optional}` - Array of `Member` IDs corresponding to participants of this meeting.
- `roomId`: `string {optional}` - ID of the room this meeting is to be scheduled in.
- `from`: `number` - Timestamp of start-time for this meeting
- `to`: `number` - Timestamp of end-time for this meeting

Checks for `participantIds` and/or `roomId`, and returns message & HTTP code appropriately.

## General remarks

- I'm a keen advocate of functional programming, so I've tried to incorporate that as a strict practice.
- I apologise for not sending a Loom on how to query using the APIs, have been tested on Postman for collisions for `Members` & `Rooms`, but I'm out of time so excluding it out.
- Have added strict typings everywhere except some minor type assertions for `ObjectId`, would've included it but running short of time, have finished this demo in roughly 2.5hrs. I've been really sick and couldn't find much time other than my regular job priorities currently.
