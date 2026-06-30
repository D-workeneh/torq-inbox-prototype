export type Phase1TitleSegment = { text: string; bold: boolean };

function seg(text: string, bold: boolean): Phase1TitleSegment {
  return { text, bold };
}

function segments(...parts: Phase1TitleSegment[]): Phase1TitleSegment[] {
  return parts;
}

/**
 * Notification title typography — bold primary entities and key metrics, regular connectors.
 * AI credit rows: bold "AI credit" and the usage %; keep "exceeded at", "usage", etc. regular.
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

  const pendingPublish = title.match(/^(.+?)\s+(is pending publish approval)$/i);
  if (pendingPublish) {
    return segments(
      seg(pendingPublish[1], true),
      seg(` ${pendingPublish[2]}`, false),
    );
  }

  const workflowRunFailed = title.match(/^Workflow run failed in\s+(.+)$/i);
  if (workflowRunFailed) {
    const name = workflowRunFailed[1].replace(/^['"]|['"]$/g, '');
    return segments(
      seg('Workflow run failed in ', false),
      seg(`'${name}'`, true),
    );
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

  const exportSucceeded = title.match(/^(Case export succeeded)\s+—\s+(.+)$/i);
  if (exportSucceeded) {
    return segments(
      seg(exportSucceeded[1], true),
      seg(' — ', false),
      seg(exportSucceeded[2], true),
    );
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

  const usageMonth = title.match(/^(AI credit usage at)\s+(\d+%)\s+(this month)$/i);
  if (usageMonth) {
    return segments(
      seg(`${usageMonth[1]} `, false),
      seg(usageMonth[2], true),
      seg(` ${usageMonth[3]}`, false),
    );
  }

  const exceededAt = title.match(/^(AI credit)\s+(exceeded at)\s+(\d+%)$/i);
  if (exceededAt) {
    return segments(
      seg(exceededAt[1], true),
      seg(` ${exceededAt[2]} `, false),
      seg(exceededAt[3], true),
    );
  }

  const aiAtUsage = title.match(/^(AI credit at)\s+(\d+%)\s+(usage)$/i);
  if (aiAtUsage) {
    return segments(
      seg(`${aiAtUsage[1]} `, false),
      seg(aiAtUsage[2], true),
      seg(` ${aiAtUsage[3]}`, false),
    );
  }

  const atUsage = title.match(/^(.+?)\s+(at)\s+(\d+%)\s+(usage)$/i);
  if (atUsage) {
    return segments(
      seg(atUsage[1], true),
      seg(` ${atUsage[2]} `, false),
      seg(atUsage[3], true),
      seg(` ${atUsage[4]}`, false),
    );
  }

  const integrationShared = title.match(/^(.+?)\s+(integration was shared with)\s+(.+)$/i);
  if (integrationShared) {
    return segments(
      seg(integrationShared[1], true),
      seg(` ${integrationShared[2]} `, false),
      seg(integrationShared[3], true),
    );
  }

  const stepShared = title.match(/^(.+?)\s+(step was shared with)\s+(.+)$/i);
  if (stepShared) {
    return segments(
      seg(stepShared[1], true),
      seg(` ${stepShared[2]} `, false),
      seg(stepShared[3], true),
    );
  }

  const dashIdx = title.indexOf(' — ');
  if (dashIdx !== -1) {
    const left = title.slice(0, dashIdx);
    const right = title.slice(dashIdx + 3);
    const leftFailure = left.match(
      /^(.+)\s+(execution failed|share failed|export failed|failed|blocked|exceeded)$/i,
    );
    const dataExportFailed = left.match(/^(Data export)\s+(failed)$/i);
    if (dataExportFailed) {
      return segments(
        seg(dataExportFailed[1], true),
        seg(` ${dataExportFailed[2]} — `, false),
        seg(right, true),
      );
    }
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
