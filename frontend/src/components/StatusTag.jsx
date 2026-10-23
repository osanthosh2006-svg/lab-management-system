import { toneOf, TONE_CLASSES } from '../utils/status';

export default function StatusTag({ status }) {
  const tone = toneOf(status);
  const classes = TONE_CLASSES[tone];

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      <span className={classes.text}>{status}</span>
    </span>
  );
}
