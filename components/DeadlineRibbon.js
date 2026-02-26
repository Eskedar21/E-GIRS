import Link from 'next/link';

/**
 * Ribbon notification to alert data contributors to submit before the assessment deadline.
 * Clickable: navigates to the submission page for the assessment year.
 */
export default function DeadlineRibbon({ year, remaining, needsCompletion = true }) {
  if (!year || !year.endDate) return null;

  const endDateStr = new Date(year.endDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const isClosed = remaining?.isOverdue;
  const submissionHref = `/data/submission?year=${year.assessmentYearId}`;

  if (isClosed) {
    return (
      <Link
        href={submissionHref}
        role="alert"
        aria-live="polite"
        className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-red-600 hover:bg-red-700 text-white shadow-md rounded-xl border border-red-700/50 transition-colors cursor-pointer"
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm" aria-hidden>
          ✓
        </span>
        <p className="text-sm font-medium text-center text-white/95">
          <span className="font-semibold">Assessment closed:</span> The submission deadline for {year.yearName} was {endDateStr}. No further submissions are accepted.
        </p>
        <span className="flex-shrink-0 text-white/80 text-xs font-medium">View →</span>
      </Link>
    );
  }

  if (!remaining) return null;

  const timeText = remaining.days === 0
    ? `${remaining.hours} hour${remaining.hours !== 1 ? 's' : ''}`
    : `${remaining.days} day${remaining.days !== 1 ? 's' : ''} ${remaining.hours}h`;

  return (
    <Link
      href={submissionHref}
      role="alert"
      aria-live="polite"
      className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white shadow-md rounded-xl border border-orange-600/50 transition-colors cursor-pointer"
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-semibold" aria-hidden>
        ⏱
      </span>
      <p className="text-sm font-medium text-center text-white/95">
        {needsCompletion ? (
          <>
            <span className="font-semibold">Submit before deadline:</span> Complete and submit your assessment for {year.yearName} in the next {timeText}. Deadline: {endDateStr}.
          </>
        ) : (
          <>
            <span className="font-semibold">Deadline soon:</span> {year.yearName} closes in {timeText} ({endDateStr}). Ensure your submission is complete.
          </>
        )}
      </p>
      <span className="flex-shrink-0 text-white/90 text-xs font-semibold">Go to submission →</span>
    </Link>
  );
}
