export type Phase1TitleSegment = { text: string; bold: boolean };

function seg(text: string, bold: boolean): Phase1TitleSegment {
  return { text, bold };
}

function segments(...parts: Phase1TitleSegment[]): Phase1TitleSegment[] {
  return parts;
}

/**
 * Notification title typography — bold primary entities, regular connector phrases.
 * Matches Notification center / Notion-style hierarchy (e.g. "AI credit limit" + "exceeded").
 */
export function parsePhase1NotifTitle(title: string): Phase1TitleSegment[] {
  const mention = title.match(/^(.+?)\s+(mentioned you in)\s+(.+)$/i);
  if (mention) {
    const rest = mention[3];
    const dash = rest.indexOf(' — ');
    if (dash !== -1) {
      return segments(
        seg(mention[1], true),
        seg(` ${mention[2]} `, false),
        seg(rest.slice(0, dash), true),
        seg(' — ', false),
        seg(rest.slice(dash + 3), true),
      );
    }
    return segments(
      seg(mention[1], true),
      seg(` ${mention[2]} `, false),
      seg(rest, true),
    );
  }

  const invited = title.match(/^(.+?)\s+(invited you to join)\s+(.+)$/i);
  if (invited) {
    return segments(seg(invited[1], true), seg(` ${invited[2]} `, false), seg(invited[3], true));
  }

  const roleAssigned = title.match(/^(.+?)\s+(role assigned in)\s+(.+)$/i);
  if (roleAssigned) {
    return segments(
      seg(roleAssigned[1], true),
      seg(` ${roleAssigned[2]} `, false),
      seg(roleAssigned[3], true),
    );
  }

  const publish = title.match(/^(.+?)\s+(requested to publish)\s+(.+)$/i);
  if (publish) {
    return segments(seg(publish[1], true), seg(` ${publish[2]} `, false), seg(publish[3], true));
  }

  const shareWithYou = title.match(/^(.+?)\s+(shared)\s+(.+?)\s+(with you)$/i);
  if (shareWithYou) {
    return segments(
      seg(shareWithYou[1], true),
      seg(` ${shareWithYou[2]} `, false),
      seg(shareWithYou[3], true),
      seg(` ${shareWithYou[4]}`, false),
    );
  }

  const wasSharedWith = title.match(/^(.+?)\s+(was shared with)\s+(.+)$/i);
  if (wasSharedWith) {
    return segments(
      seg(wasSharedWith[1], true),
      seg(` ${wasSharedWith[2]} `, false),
      seg(wasSharedWith[3], true),
    );
  }

  const wasAddedTo = title.match(/^(.+?)\s+(was added to)\s+(.+)$/i);
  if (wasAddedTo) {
    return segments(
      seg(wasAddedTo[1], true),
      seg(` ${wasAddedTo[2]} `, false),
      seg(wasAddedTo[3], true),
    );
  }

  const declinedBy = title.match(/^(.+?)\s+(sharing request was declined by)\s+(.+)$/i);
  if (declinedBy) {
    return segments(
      seg(declinedBy[1], true),
      seg(` ${declinedBy[2]} `, false),
      seg(declinedBy[3], true),
    );
  }

  const declined = title.match(/^(.+?)\s+(sharing request was declined)$/i);
  if (declined) {
    return segments(seg(declined[1], true), seg(` ${declined[2]}`, false));
  }

  const wasApproved = title.match(/^(.+?)\s+(was approved and added to your workspace)$/i);
  if (wasApproved) {
    return segments(seg(wasApproved[1], true), seg(` ${wasApproved[2]}`, false));
  }

  const exportReadyDownload = title.match(/^(Case export)\s+(ready for download)$/i);
  if (exportReadyDownload) {
    return segments(seg(exportReadyDownload[1], true), seg(` ${exportReadyDownload[2]}`, false));
  }

  const assigned = title.match(/^(Case #\d+)\s+(assigned to you)\s+—\s+(.+)$/i);
  if (assigned) {
    return segments(
      seg(assigned[1], true),
      seg(` ${assigned[2]} — `, false),
      seg(assigned[3], true),
    );
  }

  const exportReady = title.match(/^(Export ready)\s+—\s+(.+)$/i);
  if (exportReady) {
    return segments(seg(exportReady[1], true), seg(' — ', false), seg(exportReady[2], true));
  }

  const usageMonth = title.match(/^(AI credit usage)\s+(this month)$/i);
  if (usageMonth) {
    return segments(seg(usageMonth[1], true), seg(` ${usageMonth[2]}`, false));
  }

  const atUsage = title.match(/^(.+?)\s+(at \d+% usage)$/i);
  if (atUsage) {
    return segments(seg(atUsage[1], true), seg(` ${atUsage[2]}`, false));
  }

  const dashIdx = title.indexOf(' — ');
  if (dashIdx !== -1) {
    const left = title.slice(0, dashIdx);
    const right = title.slice(dashIdx + 3);
    const leftFailure = left.match(
      /^(.+)\s+(execution failed|share failed|export failed|failed|blocked|exceeded)$/i,
    );
    if (leftFailure) {
      return segments(
        seg(leftFailure[1], true),
        seg(` ${leftFailure[2]} — `, false),
        seg(right, true),
      );
    }
    return segments(seg(left, true), seg(' — ', false), seg(right, true));
  }

  const compoundAction = title.match(
    /^(.+?)\s+(health check passed|sync completed|digest is ready|publish approved|sharing request pending)$/i,
  );
  if (compoundAction) {
    return segments(seg(compoundAction[1], true), seg(` ${compoundAction[2]}`, false));
  }

  const trailingVerb = title.match(
    /^(.+?)\s+(exceeded|accepted|declined|passed|completed|blocked|ready|pending|usage)$/i,
  );
  if (trailingVerb) {
    return segments(seg(trailingVerb[1], true), seg(` ${trailingVerb[2]}`, false));
  }

  return [seg(title, true)];
}
