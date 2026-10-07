---
"@habibmustafa/ui": minor
---

`TimePicker`: the clock icon is now a button that opens an analog clock dial, in the
style of Material UI's time clock — pick hours, then minutes (then seconds), by clicking
or dragging on the face; 24-hour mode uses an inner ring for 13–23 and 00, 12-hour mode
adds AM/PM toggles. The dial is a keyboard-operable slider (arrows, PageUp/PageDown,
Home/End, Enter to continue). Pass `clock={false}` to keep the plain icon.
